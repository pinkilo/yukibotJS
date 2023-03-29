import Command from "./Command"
import yt from "../../youtube"
import MS from "../MoneySystem"
import logger from "winston"

export default new Command(
  "wallet", ["bank"], 0,
  async ({ authorDetails }, tokens) => {
    if (tokens.params.length > 0 && authorDetails.isChatModerator) {
      // TODO add modification commands
      return
    }
    const failed = await yt.chat.sendMessage(MS.getWallet(authorDetails.channelId))
    if (failed) logger.error("failed to send message")
  },
)
