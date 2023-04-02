import Passive from "./Passive"
import MoneySystem from "../MoneySystem"
import logger from "winston"

const moneyCooldown = 2
/** amount of money earned per cooldown */
const moneyEarnRate = 2
const cooldowns: Record<string, number> = {}

export default new Passive(
  async (_, { isCommand }) => !isCommand,
  async ({ authorDetails: { channelId } }) => {
    for (let k in cooldowns) {
      if (k === channelId) continue
      cooldowns[k] = cooldowns[k] - 1
      if (cooldowns[k] < 1) delete cooldowns[k]
    }
    if (!cooldowns[channelId]) {
      logger.debug(`adding passive money to ${ channelId }`)
      await MoneySystem.transactionBatch([[channelId, moneyEarnRate]])
      cooldowns[channelId] = moneyCooldown
    }
  },
)
