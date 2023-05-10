import { createLogger, format, Logger, transports } from "winston"
import { youtube_v3 } from "googleapis"
import { Credentials } from "google-auth-library"
import {
  AuthEvent,
  BroadcastUpdateEvent,
  Eventbus,
  EventType,
  MessageBatchEvent,
  Result,
  YoutubeWrapper,
} from "../internal"
import { Command, CommandBuilder } from "./commands"
import Yuki, { GoogleConfig, YukiConfig } from "./Yuki"
import { MemoryPassive, Passive } from "./passives"
import { TokenBin, tokenize } from "./tokenization"
import Schema$LiveBroadcast = youtube_v3.Schema$LiveBroadcast
import Schema$LiveChatMessage = youtube_v3.Schema$LiveChatMessage

/**
 * @returns {Yuki} the constructed bot instance or undefined if building failed
 */
export const yuki = async (
  dsl: (builder: YukiBuilder) => unknown
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

  private prebuildCheck(): boolean {
    if (!(this.youtube instanceof YoutubeWrapper)) {
      this.logger.error(
        "google config not set. make sure you've used `builder.googleConfig = {...}`"
      )
      return false
    }
    if (typeof this.tokenLoader !== "function") {
      this.logger.error(
        "token loader not set. make sure you've used `builder.tokenLoader = () => ...`"
      )
      return false
    }
    if (
      this.eventbus.size === 0 &&
      this.passives.length === 0 &&
      this.commands.size === 0
    ) {
      // don't fail, just warn
      this.logger.alert("no commands, passives, or listeners were set")
    }
    return true
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

  passive(
    predicate: (
      msg: Schema$LiveChatMessage,
      tokens: TokenBin,
      self: Passive
    ) => Promise<boolean>,
    invoke: (
      msg: Schema$LiveChatMessage,
      tokens: TokenBin,
      self: Passive
    ) => Promise<void>
  ) {
    this.passives.push(new Passive(predicate, invoke))
  }

  memoryPassive<Memory>(
    seed: Memory,
    predicate: (
      msg: Schema$LiveChatMessage,
      tokens: TokenBin,
      self: MemoryPassive<Memory>
    ) => Promise<boolean>,
    invoke: (
      msg: Schema$LiveChatMessage,
      tokens: TokenBin,
      self: MemoryPassive<Memory>
    ) => Promise<void>
  ) {
    this.passives.push(new MemoryPassive(seed, predicate, invoke))
  }

  onMessage<T = unknown>(
    listener: (message: Schema$LiveChatMessage) => T,
    deathPredicate?: (
      message: Schema$LiveChatMessage,
      data?: T
    ) => Promise<boolean>
  ) {
    this.eventbus.listen<MessageBatchEvent>(
      EventType.MESSAGE_BATCH,
      async ({ incoming }, self) => {
        for (const msg of incoming) {
          const value = await listener(msg)
          if (deathPredicate && (await deathPredicate(msg, value))) {
            self.remove()
            return
          }
        }
      }
    )
  }

  onBroadcastUpdate<T = unknown>(
    listener: (broadcast: Schema$LiveBroadcast) => T,
    deathPredicate?: (
      broadcast: Schema$LiveBroadcast,
      data?: T
    ) => Promise<boolean>
  ) {
    this.eventbus.listen<BroadcastUpdateEvent>(
      EventType.BROADCAST_UPDATE,
      async (e, self) => {
        const value = await listener(e.broadcast)
        if (deathPredicate && (await deathPredicate(e.broadcast, value))) {
          self.remove()
        }
      }
    )
  }

  /**
   * Called when auth tokens are updated. usually useful when waiting
   * on login to start the bot
   */
  onAuthUpdate(
    listener: () => unknown,
    deathPredicate?: () => Promise<boolean>
  ) {
    this.eventbus.listen<AuthEvent>(EventType.AUTH, async (_, self) => {
      await listener()
      if (deathPredicate && (await deathPredicate())) self.remove()
    })
  }

  async sendMessage(
    messageText: string
  ): Promise<Result<Schema$LiveChatMessage>> {
    return this.youtube.broadcasts.sendMessage(messageText)
  }

  build(): Yuki {
    if (!this.prebuildCheck()) {
      this.logger.error("failed to build yukibot")
      return undefined
    }
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
