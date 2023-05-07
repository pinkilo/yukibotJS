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
  invoke: (
    msg: Schema$LiveChatMessage,
    tokens: TokenBin,
    _this: Command
  ) => Promise<unknown>

  constructor(logger: Logger) {
    this.logger = logger
  }

  private prebuildCheck(): boolean {
    if (this.name === undefined) {
      this.logger.error("no name set in command builder")
      return false
    }
    return true
  }

  /**
   * @returns a newly built Command or undefined if failed
   */
  build(): Command {
    if (!this.prebuildCheck()) {
      this.logger.error("failed to build command")
      return undefined
    }
    return new Command(
      this.name,
      this.alias || [],
      this.rateLimit?.individual || 0,
      this.rateLimit?.global || 0,
      this.logger,
      this.invoke
    )
  }
}
