import Command from "./Command"
import { addAlert } from "../Alerts"
import youtube from "../../youtube"
import MoneySystem from "../MoneySystem"
import MS from "../MoneySystem"

export const FitCheck = new Command(
  "fitcheck",
  [],
  100,
  60 * 10,
  60 * 5,
  async (msg, _, _this) => {
    addAlert({
      description: `Fit Check Redemption`,
      redeemer: {
        name: msg.authorDetails.displayName,
        id: msg.authorDetails.channelId,
      },
      durationSec: 10,
    })
  }
)

/**
 * @command pushups [int = 10]
 * @description redeem N number of pushups for baseCost + N * baseCost * 0.5
 */
export const Pushups = new Command(
  "pushups",
  ["pushup"],
  100,
  60 * 60,
  60 * 20,
  async ({ authorDetails: { channelId, displayName } }, tokens, _this) => {
    const base = 10
    const count = parseInt(tokens.params[0]) || base
    const addedCost = Math.max(0, count - base) * _this.cost * 0.5
    if (addedCost > 0 && MS.walletCache.get(channelId) < addedCost) {
      await MoneySystem.transactionBatch([[channelId, _this.cost]])
      return undefined
    }
    await MoneySystem.transactionBatch([[channelId, -addedCost]])
    addAlert({
      description: `Pushups: ${count}`,
      redeemer: { name: displayName, id: channelId },
      durationSec: 10,
    })
    await youtube.chat.sendMessage(
      `${displayName} redeemed ${count} pushups for ${_this.cost + addedCost}
       ${MoneySystem.name}s`
    )
  }
)
