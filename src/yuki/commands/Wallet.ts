import Command from "./Command"
import yt from "../../youtube"
import MS from "../MoneySystem"
import logger from "winston"

/**
 * TODO add params for leaderboard/rank
 */
export default new Command(
  "wallet", ["bank"], 0, 120,
  async ({ authorDetails }, tokens) => {
    if (tokens.params.length > 0 && authorDetails.isChatModerator) {
      // TODO add modification commands
      return
    }
    const wallet = MS.getWallet(authorDetails.channelId)
    const failed = await yt.chat.sendMessage(
      `${ authorDetails.displayName } has ${ wallet } ${ MS.name }s`,
    )
    if (failed) logger.error("failed to send message")
  },
)
