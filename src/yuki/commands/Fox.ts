import Command from "./Command"
import { setAnimation } from "../fox"
import { randFromRange } from "../../util"

const attack = new Command(
  "attack", [], 5, 2 * 60, 20,
  async (msg) => {
    setAnimation("attack", msg.authorDetails.displayName)
  })

const feed = new Command(
  "feed", [], 5, 3 * 60, 30,
  async ({ authorDetails: { channelId } }, _, _this) => {
    setAnimation("eat")
    return {
      uids: [channelId],
      amount: randFromRange(_this.cost * 1.1, _this.cost * 2),
    }
  })

const dance = new Command(
  "dance", [], 5, 3 * 60, 20,
  async ({ authorDetails: { channelId } }, _, _this) => {
    setAnimation("dance")
    return {
      uids: [channelId],
      amount: randFromRange(_this.cost, _this.cost * 1.5),
    }
  })

export default { attack, feed, dance }
