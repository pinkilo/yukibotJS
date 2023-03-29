import yt from "../../youtube"
import Command from "./Command"
import logger from "winston"
import { getRandomChatter } from "../../youtube/chat"

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
    const target = getRandomChatter([channelId])
    logger.debug("running beatass", { target: target?.displayName, displayName })
    const failed = await yt.chat.sendMessage(
      Math.random() > 0.5
        ? `${ displayName } beat ${ target.displayName }'s ass`
        : `${ target.displayName } smacked the shit outta ${ displayName }`,
    )
    if (failed) logger.error("failed to send message")
  },
)
