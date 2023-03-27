import yt from "../../YoutubeApi"
import { Command } from "./command"
import * as console from "console"

/**
 * Randomly selects another chat member to "fight"
 * Rolls odds (for now 50:50)
 * Announces winner in chat
 *
 * TODO add monetary system hook
 */
const beatass: Command = {
  name: "beatass",
  invoke: async () => {
    // TODO actual command stuff
    const failed = await yt.sendMessage("BEAT ASS")
    if (failed) console.error("Failed to send message")
  },
}

export default beatass
