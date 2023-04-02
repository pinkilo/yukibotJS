import Passive from "./Passive"
import logger from "winston"
import { setAnimation } from "../fox"

const firstMessage: Record<string, any> = {}

const greeting = new Passive(
  async ({ authorDetails: { channelId } }, { isCommand }) => {
    return !isCommand && firstMessage[channelId] === undefined
  },
  async (msg) => {
    const uid = msg.authorDetails.channelId
    logger.debug(`Greeting "${ msg.authorDetails.channelId }"`)
    setAnimation("greet", msg.authorDetails.displayName)
    firstMessage[uid] = true
  })

export default { greeting }
