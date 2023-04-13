import Command from "./Command"
import { addAlert } from "../Alerts"

export const FitCheck = new Command(
  "fitcheck", [], 100, 60 * 10, 60 * 5,
  async (msg, _, _this) => {
    addAlert({
      message: `${ msg.authorDetails.displayName } redeemed a Fit Check`,
      redeemer: { name: msg.authorDetails.displayName, id: msg.authorDetails.channelId },
      durationSec: 10,
    })
  })
