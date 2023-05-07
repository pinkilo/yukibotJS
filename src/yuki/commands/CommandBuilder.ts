import { TokenBin } from "../tokenization"
import { youtube_v3 } from "googleapis"
import Schema$LiveChatMessage = youtube_v3.Schema$LiveChatMessage
import Command from "./Command"
import { Logger } from "winston"

export default class CommandBuilder {
  private readonly logger: Logger

  name: string
  alias?: string[]
  rateLimit?: {
    /** personal ratelimit in seconds */
    individual?: number
    /** global ratelimit in seconds */
    global?: number
  }

  constructor(logger: Logger) {
    this.logger = logger
  }

  invoke: (
    msg: Schema$LiveChatMessage,
    tokens: TokenBin,
    _this: Command
  ) => Promise<unknown>

  build(): Command {
    return new Command(
      this.name,
      this.alias || [],
      this.rateLimit?.individual || 0,
      this.rateLimit.global || 0,
      this.logger,
      this.invoke
    )
  }
}
