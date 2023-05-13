import { youtube_v3 } from "googleapis"
import Schema$LiveChatMessage = youtube_v3.Schema$LiveChatMessage
import { TokenBin } from "../tokenization"

export default class Passive {
  readonly predicate: (
    msg: Schema$LiveChatMessage,
    tokens: TokenBin,
    self: Passive
  ) => Promise<boolean>
  readonly invoke: (
    msg: Schema$LiveChatMessage,
    tokens: TokenBin,
    self: Passive
  ) => Promise<void>

  constructor(
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
    this.predicate = predicate
    this.invoke = invoke
  }
}
