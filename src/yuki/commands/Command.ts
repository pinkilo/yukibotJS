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
  /** ratelimit in seconds */
  readonly ratelimit: number
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
    invoke: (msg: ChatMessage,
      tokens: TokenBin,
      _this: Command,
    ) => Promise<Payout | void>,
  ) {
    this.name = name
    this.alias = alias
    this.cost = cost
    this.ratelimit = ratelimit
    this.invoke = invoke
  }

  async execute(msg: ChatMessage, tokens: TokenBin): Promise<void> {
    if (this.getCooldownInSec(msg.authorDetails.channelId) > 0) return
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

  addCooldown(uid: string) {
    const ts = new Date().getTime() + (this.ratelimit * 1000)
    this.cooldowns[uid] = ts
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

