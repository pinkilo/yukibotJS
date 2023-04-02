import Passive from "./Passive"
import logger from "winston"
import { setAnimation } from "../fox"

const firstMessage: Record<string, boolean> = {}

export default new Passive(async () => true,
  async (msg) => {
    const uid = msg.authorDetails.channelId
    // greet
    if (firstMessage[uid] !== undefined) {
      logger.debug(`Greeting "${ msg.authorDetails.channelId }"`)
      setAnimation("greet", msg.authorDetails.displayName)
    }
    // attack
  })
