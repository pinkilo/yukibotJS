import { createLogger, format, Logger, transports } from "winston"
import { youtube_v3 } from "googleapis"
import { Credentials } from "google-auth-library"
import {
  BroadcastUpdateEvent,
  Eventbus,
  EventType,
  MessageBatchEvent,
  YoutubeWrapper,
} from "../internal"
import { Command, CommandBuilder } from "./commands"
import Yuki, { GoogleConfig, YukiConfig } from "./Yuki"
import { Passive } from "./passives"
import { TokenBin, tokenize } from "./tokenization"
import Schema$LiveBroadcast = youtube_v3.Schema$LiveBroadcast
import Schema$LiveChatMessage = youtube_v3.Schema$LiveChatMessage
import { Result } from "../internal/util"

export const yuki = async (
  dsl: (builder: YukiBuilder) => Promise<unknown>
): Promise<Yuki> => {
  const builder = new YukiBuilder()
  await dsl(builder)
  return builder.build()
}

/**
 * TODO passives DSL
 */
export default class YukiBuilder {
  private readonly eventbus: Eventbus = new Eventbus()
  private readonly commands: Map<string, Command> = new Map()
  private readonly passives: Passive[] = []
  private youtube: YoutubeWrapper
  private logger: Logger

  tokenLoader: () => Promise<Credentials>
  yukiConfig: YukiConfig = {
    name: "yuki",
    chatPollRate: 14.4 * 1000,
    broadcastPollRage: 2 * 60 * 1000,
    prefix: /^([>!]|y!)$/gi,
  }

  constructor() {
    this.logLevel = "none"
  }

  private async runCmd(
    name: string,
    msg: Schema$LiveChatMessage,
    tokens: TokenBin
  ) {
    const cmd = this.commands.get(name)
    if (cmd !== undefined) {
      this.logger.info(`executing "${name}"`)
      await cmd?.execute(msg, tokens)
    } else {
      this.logger.debug(`no command found with name "${name}"`)
    }
  }

  /** @see https://github.com/winstonjs/winston#logging */
  set logLevel(
    logLevel:
      | "error"
      | "warn"
      | "info"
      | "http"
      | "verbose"
      | "debug"
      | "sill"
      | "none"
  ) {
    this.logger = createLogger({
      level: logLevel === "none" ? "info" : logLevel,
      silent: logLevel === "none",
      transports: [new transports.Console()],
      format: format.combine(
        format.errors({ stack: true }),
        format.colorize({ all: true }),
        format.timestamp(),
        format.printf(
          (info) =>
            `[${info.timestamp}] ${this.yukiConfig.name} ${info.level}: ${
              info.message
            } ${info.err || ""}`
        )
      ),
    })
  }

  set googleConfig({ clientId, clientSecret, redirectUri }: GoogleConfig) {
    this.youtube = new YoutubeWrapper(
      clientId,
      clientSecret,
      redirectUri,
      this.logger
    )
  }

  async command(dsl: (builder: CommandBuilder) => unknown) {
    const builder = new CommandBuilder(this.logger)
    await dsl(builder)
    const command = builder.build()
    for (const cname in [command.name, ...command.alias]) {
      this.commands.set(cname, command)
    }
  }

  onMessage(cb: (message: Schema$LiveChatMessage) => unknown) {
    this.eventbus.listen<MessageBatchEvent>(
      EventType.MESSAGE_BATCH,
      async ({ incoming }) => {
        for (const msg of incoming) {
          await cb(msg)
        }
      }
    )
  }

  onBroadcastUpdate(cb: (broadcast: Schema$LiveBroadcast) => Promise<unknown>) {
    this.eventbus.listen<BroadcastUpdateEvent>(
      EventType.BROADCAST_UPDATE,
      (e) => cb(e.broadcast)
    )
  }

  async sendMessage(
    messageText: string
  ): Promise<Result<Schema$LiveChatMessage>> {
    return this.youtube.broadcasts.sendMessage(messageText)
  }

  build(): Yuki {
    // command listener
    if (Array.from(this.commands.keys()).length > 0) {
      this.onMessage(async (msg) => {
        const tokens = tokenize(
          msg.snippet.displayMessage,
          this.yukiConfig.prefix
        )
        this.logger.debug("tokenized", { tokens })
        if (tokens.isCommand) await this.runCmd(tokens.command, msg, tokens)
        // run passives
        const predicates = await Promise.all(
          this.passives.map((p) => p.predicate(msg, tokens, p))
        )
        this.logger.info(`running ${predicates.length} passives`)
        await Promise.all(
          this.passives
            .filter((_, i) => predicates[i])
            .map((p) => p.invoke(msg, tokens, p))
        )
      })
    }
    return new Yuki(
      this.yukiConfig,
      this.youtube,
      this.tokenLoader,
      this.eventbus,
      this.logger
    )
  }
}
