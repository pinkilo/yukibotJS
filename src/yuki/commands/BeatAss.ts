import yt from "../../YoutubeApi"
import Command from "./Command"
import * as console from "console"

/**
 * Randomly selects another chat member to "fight"
 * Rolls odds (for now 50:50)
 * Announces winner in chat
 *
 * TODO Additional text version
 */
export default new Command(
  "beatass", ["pickfight"], 10,
  async ({ authorDetails: { displayName, channelId } }) => {
    const chatters = yt.getChatters().filter(u => u.channelId !== channelId)
    const target = chatters[Math.floor(Math.random() * chatters.length)]
    const failed = await yt.sendMessage(
      Math.random() > 0.5
        ? `${ displayName } beat ${ target.displayName }'s ass`
        : `${ target.displayName } smacked the shit outta ${ displayName }`,
    )
    if (failed) console.error("Failed to send message")
  },
)
