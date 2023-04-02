import { ChatMessage } from "../../types/google"
import { TokenBin } from "../processing"

export default class Passive {
  readonly predicate: (msg: ChatMessage,
    tokens: TokenBin,
    _this: Passive,
  ) => Promise<boolean>

  readonly invoke: (msg: ChatMessage,
    tokens: TokenBin,
    _this: Passive,
  ) => Promise<void>

  constructor(
    predicate: (msg: ChatMessage,
      tokens: TokenBin,
      _this: Passive,
    ) => Promise<boolean>,
    invoke: (msg: ChatMessage,
      tokens: TokenBin,
      _this: Passive,
    ) => Promise<void>,
  ) {
    this.predicate = predicate
    this.invoke = invoke
  }
}
