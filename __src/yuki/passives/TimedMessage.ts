import Passive from "./Passive"
import env from "../../env"
import yt from "../../youtube"

class TimedMessage extends Passive {
  private counter = 0

  /**
   * @param message the message to send
   * @param msgDelay number of messages between invocation
   */
  constructor(message: string, msgDelay: number) {
    super(
      async (msg) => {
        if (msg.authorDetails.channelId === env.SELF.ID) this.counter--
        else this.counter++
        if (this.counter > msgDelay) {
          this.counter = 0
          return true
        }
        return false
      },
      async () => {
        await yt.chat.sendMessage(message)
      }
    )
  }
}
