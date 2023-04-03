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
    // TODO add more greetings
    setAnimation("greet", `Hello ${msg.authorDetails.displayName}!`)
    firstMessage[uid] = true
  })

let cooldown = 0

const good = new Passive(
  async (_, { isCommand, msg }) => {
    return !isCommand && msg.toLowerCase().includes("good") && cooldown-- < 1
  },
  async () => {
    logger.debug("running Fox.good")
    setAnimation("greet", "HI YES I IS GOOD!")
    cooldown = 5
  })

export default { greeting, good }
