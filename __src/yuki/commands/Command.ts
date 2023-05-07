import { TokenBin } from "../processing"
import MS from "../MoneySystem"
import { ChatMessage } from "../../types/google"
import logger from "winston"

type Payout = {
  uids: string[]
  amount: number | number[]
}

export default class Command {
  readonly name: string
  readonly alias?: string[]
  /** personal ratelimit in seconds */
  readonly ratelimit: number
  /** global ratelimit in seconds */
  readonly globalRateLimit: number
  readonly cooldowns: Map<string, number> = new Map()
  readonly costFun: (
    msg: ChatMessage,
    tokens: TokenBin,
    _this: Command
  ) => Promise<number>
  readonly invoke: (
    msg: ChatMessage,
    tokens: TokenBin,
    cost: number,
    _this: Command
  ) => Promise<Payout | void>

  constructor(
    name: string,
    alias: string[],
    cost: number,
    ratelimit: number,
    globalRatelimit: number,
    invoke: (
      msg: ChatMessage,
      tokens: TokenBin,
      cost: number,
      _this: Command
    ) => Promise<Payout | void>
  )

  constructor(
    name: string,
    alias: string[],
    cost: (
      msg: ChatMessage,
      tokens: TokenBin,
      _this: Command
    ) => Promise<number>,
    ratelimit: number,
    globalRatelimit: number,
    invoke: (
      msg: ChatMessage,
      tokens: TokenBin,
      cost: number,
      _this: Command
    ) => Promise<Payout | void>
  )

  constructor(
    name: string,
    alias: string[],
    cost:
      | number
      | ((
          msg: ChatMessage,
          tokens: TokenBin,
          _this: Command
        ) => Promise<number>),
    ratelimit: number = 60,
    globalRatelimit: number = 60,
    invoke: (
      msg: ChatMessage,
      tokens: TokenBin,
      cost: number,
      _this: Command
    ) => Promise<Payout | void>
  ) {
    this.name = name
    this.alias = alias
    this.costFun = cost instanceof Function ? cost : async () => cost
    this.globalRateLimit = globalRatelimit
    this.ratelimit = ratelimit
    this.invoke = invoke
  }

  async execute(msg: ChatMessage, tokens: TokenBin): Promise<void> {
    // check cooldown
    if (this.onCooldown(msg.authorDetails.channelId)) {
      logger.debug(
        `${this.name} on cooldown for ${msg.authorDetails.displayName}`
      )
      return
    }
    // generate cost
    const cost = await this.costFun(msg, tokens, this)
    // check affordability
    if (cost > 0 && MS.walletCache.get(msg.authorDetails.channelId) < cost) {
      logger.debug(
        `${this.name} failed cost check for ${msg.authorDetails.displayName}`
      )
      return
    }
    await MS.transactionBatch([[msg.authorDetails.channelId, cost]])
    const result = await this.invoke(msg, tokens, cost, this)
    if (result instanceof Object) await this.payout(result)
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

  async payout({ uids, amount }: Payout): Promise<void> {
    const getAmount = (index: number) =>
      Array.isArray(amount) ? amount[index] : amount
    await MS.transactionBatch(uids.map((uid, i) => [uid, getAmount(i)]))
  }
}
