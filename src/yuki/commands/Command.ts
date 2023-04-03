import { TokenBin } from "../processing"
import MoneySystem from "../MoneySystem"
import { ChatMessage } from "../../types/google"

type Payout = {
  uids: string[],
  amount: number | number[]
}

export default class Command {

  readonly name: string
  readonly alias?: string[]
  readonly cost: number
  /** personal ratelimit in seconds */
  readonly ratelimit: number
  /** global ratelimit in seconds */
  readonly globalRateLimit: number
  private cooldowns: Map<string, number> = new Map()
  private readonly invoke: (msg: ChatMessage,
    tokens: TokenBin,
    _this: Command,
  ) => Promise<Payout | void>

  constructor(
    name: string,
    alias: string[],
    cost: number,
    ratelimit: number = 60,
    globalRatelimit: number = 60,
    invoke: (msg: ChatMessage,
      tokens: TokenBin,
      _this: Command,
    ) => Promise<Payout | void>,
  ) {
    this.name = name
    this.alias = alias
    this.cost = cost
    this.globalRateLimit = globalRatelimit
    this.ratelimit = ratelimit
    this.invoke = invoke
  }

  async execute(msg: ChatMessage, tokens: TokenBin): Promise<void> {
    if (this.onCooldown(msg.authorDetails.channelId)) return
    if (this.canAfford(msg.authorDetails.channelId)) {
      if (this.cost > 0) {
        await MoneySystem.transactionBatch([[msg.authorDetails.channelId, this.cost]])
      }
      const result = await this.invoke(msg, tokens, this)
      if (this.payout && result) await this.payout(result)
    }
    this.addCooldown(msg.authorDetails.channelId)
  }

  canAfford(uid: string): boolean {
    return this.cost > 0 ? MoneySystem.getWallet(uid) >= this.cost : true
  }

  onCooldown(uid: string): boolean {
    return this.globalRateLimit > 0 && this.getCooldownInSec("GLOBAL") > 0
      || this.ratelimit > 0 && this.getCooldownInSec(uid) > 0
  }

  addCooldown(uid: string) {
    this.cooldowns[uid] = new Date().getTime() + (this.ratelimit * 1000)
    if (this.globalRateLimit > 0) {
      this.cooldowns["GLOBAL"] = new Date().getTime() + (this.globalRateLimit * 1000)
    }
  }

  /** @returns {number} - The cooldown in seconds */
  getCooldownInSec(uid: string): number {
    return this.cooldowns[uid] ? (this.cooldowns[uid] - new Date().getTime()) / 1000 : 0
  }

  async payout({ uids, amount }: Payout): Promise<void> {
    const getAmount = (index: number) => Array.isArray(amount) ? amount[index] : amount
    await MoneySystem.transactionBatch(uids.map((uid, i) => [uid, getAmount(i)]))
  }

}

