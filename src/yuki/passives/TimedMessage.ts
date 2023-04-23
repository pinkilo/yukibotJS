import Passive from "./Passive"
import env from "../../env"
import yt from "../../youtube"

class TimedMessage extends Passive {
  private counter: number = 0

  /**
   * @param message the message to send
   * @param msgDelay number of messages between invocation
   */
  constructor(message: string, msgDelay: number) {
    super(
      async (msg) => {
        if (msg.authorDetails.channelId !== env.SELF.ID) this.counter++
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

export const bankMessage = new TimedMessage(
  "Remember to use >bank to check your Rupee wallet!",
  25
)
export const discordMessage = new TimedMessage(
  "Join the NL Discord to chat and get updates about the stream https://discord.gg/3dYzJXJStR",
  35
)

export const aquaticMasteryMessage = new TimedMessage(
  "Like fish and aquariums? Like looking at my face? Well if you do, make sure to check out my personal YouTube channel, Aquatic Mastery! https://www.youtube.com/aquaticmaster",
  45
)

export const commandsMessage = new TimedMessage(
  "Use >cmds or >commands to get a list of all of the bot commands!",
  15
)
