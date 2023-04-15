import Command from "./Command"
import yt from "../../youtube"

export default new Command("commands", ["cmds"], 0, 0, 360, async () => {
  await yt.chat.sendMessage(
    "Find a list of commands here https://tinyurl.com/mt8c5v47"
  )
})
