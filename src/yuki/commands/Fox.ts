import Command from "./Command"
import { setAnimation } from "../fox"
import { randFromRange } from "../../util"

const attack = new Command("attack", [], 5, 2 * 60, 20, async (msg) => {
  setAnimation("attack", msg.authorDetails.displayName)
})

const feed = new Command(
  "feed",
  [],
  5,
  3 * 60,
  30,
  async ({ authorDetails: { channelId } }, _, cost) => {
    setAnimation("eat")
    return {
      uids: [channelId],
      amount: randFromRange(cost * 1.1, cost * 2),
    }
  }
)

const dance = new Command(
  "dance",
  [],
  5,
  3 * 60,
  20,
  async ({ authorDetails: { channelId } }, _, cost) => {
    setAnimation("dance")
    return {
      uids: [channelId],
      amount: randFromRange(cost, cost * 1.5),
    }
  }
)

export default { attack, feed, dance }
