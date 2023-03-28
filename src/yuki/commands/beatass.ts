import yt from "../../YoutubeApi"
import { Command } from "./command"
import * as console from "console"

/**
 * Randomly selects another chat member to "fight"
 * Rolls odds (for now 50:50)
 * Announces winner in chat
 *
 * TODO add monetary system hook
 * TODO Additional text version
 */
const beatass: Command = {
  name: "beatass",
  alias: ["pickfight"],
  invoke: async ({ authorDetails: { displayName, channelId } }) => {
    const chatters = yt.getChatters().filter(u => u.channelId !== channelId)
    const target = chatters[Math.floor(Math.random() * chatters.length)]
    const failed = await yt.sendMessage(
      Math.random() > 0.5
        ? `${ displayName } beat ${ target.displayName }'s ass`
        : `${ target.displayName } smacked the shit outta ${ displayName }`,
    )
    if (failed) console.error("Failed to send message")
  },
}

export default beatass
