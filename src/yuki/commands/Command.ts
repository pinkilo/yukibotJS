import { TokenBin } from "../processing"
import MoneySystem from "../monetary"
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
    const uid = msg.authorDetails.channelId
    if (this.canAfford(uid)) {
      MoneySystem.bank[uid] = MoneySystem.bank[uid] - this.cost
      return this.invoke(msg, tokens)
    }
  }

  canAfford(uid: string): boolean {
    return this.cost ? MoneySystem.bank[uid] < this.cost : true
  }

}

