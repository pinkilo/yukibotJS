import Passive from "./Passive"
import logger from "winston"
import { setAnimation } from "../fox"

const firstMessage: Record<string, any> = {}

export default new Passive(async () => true,
  async (msg, { isCommand }) => {
    if (isCommand) return
    const uid = msg.authorDetails.channelId
    if (firstMessage[uid] === undefined) { // greet
      logger.debug(`Greeting "${ msg.authorDetails.channelId }"`)
      setAnimation("greet", msg.authorDetails.displayName)
      firstMessage[uid] = true
    }
  })
