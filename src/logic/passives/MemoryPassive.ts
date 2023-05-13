import Passive from "./Passive"
import { youtube_v3 } from "googleapis"
import { TokenBin } from "../tokenization"
import Schema$LiveChatMessage = youtube_v3.Schema$LiveChatMessage

export default class MemoryPassive<Memory = void> extends Passive {
  memory: Memory

  constructor(
    initMemory: Memory,
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
    super(predicate, invoke)
    this.memory = initMemory
  }
}
