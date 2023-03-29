import { TokenBin } from "../processing"
import MoneySystem from "../MoneySystem"
import { ChatMessage } from "../../types/google"

type Payout = {
  uids: string[],
  amount: number | number[]
}

// TODO add ratelimiter
export default class Command {

  readonly name: string
  readonly alias?: string[]
  readonly cost?: number
  private readonly invoke: (msg: ChatMessage,
    tokens: TokenBin,
    _this: Command,
  ) => Promise<Payout | void>

  constructor(
    name: string,
    alias: string[],
    cost: number,
    invoke: (msg: ChatMessage,
      tokens: TokenBin,
      _this: Command,
    ) => Promise<Payout | void>,
  ) {
    this.name = name
    this.alias = alias
    this.cost = cost
    this.invoke = invoke
  }

  async execute(msg: ChatMessage, tokens: TokenBin): Promise<void> {
    if (this.canAfford(msg.authorDetails.channelId)) {
      await MoneySystem.transactionBatch([[msg.authorDetails.channelId, this.cost]])
      const result = await this.invoke(msg, tokens, this)
      if (this.payout && result) await this.payout(result)
    }
  }

  canAfford(uid: string): boolean {
    return this.cost ? MoneySystem.getWallet(uid) >= this.cost : true
  }

  async payout({ uids, amount }: Payout): Promise<void> {
    const getAmount = (index: number) => Array.isArray(amount) ? amount[index] : amount
    await MoneySystem.transactionBatch(uids.map((uid, i) => [uid, getAmount(i)]))
  }

}

