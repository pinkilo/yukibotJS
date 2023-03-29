import { TokenBin } from "../processing"
import MoneySystem from "../MoneySystem"
import { ChatMessage } from "../../types/google"

// TODO add ratelimiter
export default class Command {
  readonly name: string
  readonly alias?: string[]
  readonly cost?: number
  private readonly invoke: (msg: ChatMessage, tokens: TokenBin) => Promise<void>

  constructor(
    name: string,
    alias: string[],
    cost: number,
    invoke: (msg: ChatMessage, tokens: TokenBin) => Promise<void>,
  ) {
    this.name = name
    this.alias = alias
    this.cost = cost
    this.invoke = invoke
  }

  async execute(msg: ChatMessage, tokens: TokenBin): Promise<void> {
    if (this.canAfford(msg.authorDetails.channelId)) {
      await MoneySystem.removeMoney(msg.authorDetails.channelId, this.cost)
      return this.invoke(msg, tokens)
    }
  }

  canAfford(uid: string): boolean {
    return this.cost ? MoneySystem.getWallet(uid) >= this.cost : true
  }

}

