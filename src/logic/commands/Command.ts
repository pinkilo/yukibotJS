import { Logger } from "winston"
import { TokenBin } from "../tokenization"
import { youtube_v3 } from "googleapis"
import Schema$LiveChatMessage = youtube_v3.Schema$LiveChatMessage

export default class Command {
  private readonly logger: Logger
  readonly name: string
  readonly alias: string[]
  /** personal ratelimit in seconds */
  readonly ratelimit: number
  /** global ratelimit in seconds */
  readonly globalRateLimit: number
  readonly cooldowns: Map<string, number> = new Map()

  readonly invoke: (
    msg: Schema$LiveChatMessage,
    tokens: TokenBin,
    _this: Command
  ) => Promise<unknown>

  constructor(
    name: string,
    alias: string[],
    ratelimit: number,
    globalRatelimit: number,
    logger: Logger,
    invoke: (
      msg: Schema$LiveChatMessage,
      tokens: TokenBin,
      _this: Command
    ) => Promise<unknown>
  ) {
    this.name = name
    this.alias = alias
    this.globalRateLimit = globalRatelimit
    this.ratelimit = ratelimit
    this.invoke = invoke
    this.logger = logger
  }

  async execute(msg: Schema$LiveChatMessage, tokens: TokenBin): Promise<void> {
    // check cooldown
    if (this.onCooldown(msg.authorDetails.channelId)) {
      this.logger.debug(
        `${this.name} on cooldown for ${msg.authorDetails.displayName}`
      )
      return
    }
    try {
      await this.invoke(msg, tokens, this)
    } catch (err) {
      this.logger.error(`failed to invoke ${this.name}`, { err })
      return
    }
    if (this.ratelimit + this.globalRateLimit > 0)
      this.addCooldown(msg.authorDetails.channelId)
  }

  onCooldown(uid: string): boolean {
    return (
      (this.globalRateLimit > 0 && this.getCooldownInSec("GLOBAL") > 0) ||
      (this.ratelimit > 0 && this.getCooldownInSec(uid) > 0)
    )
  }

  addCooldown(uid: string) {
    this.cooldowns.set(uid, new Date().getTime() + this.ratelimit * 1000)
    if (this.globalRateLimit > 0) {
      this.cooldowns.set(
        "GLOBAL",
        new Date().getTime() + this.globalRateLimit * 1000
      )
    }
  }

  /** @returns {number} - The cooldown in seconds */
  getCooldownInSec(uid: string): number {
    return this.cooldowns.has(uid)
      ? (this.cooldowns.get(uid) - new Date().getTime()) / 1000
      : 0
  }
}
