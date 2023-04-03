import Command from "./Command"
import { setAnimation } from "../fox"

const attack = new Command(
  "attack", [], 5, 60, 20,
  async (msg) => {
    setAnimation("attack", msg.authorDetails.displayName)
  })

const feed = new Command(
  "feed", [], 5, 60, 20,
  async () => {
    setAnimation("eat")
  })

const dance = new Command(
  "dance", [], 5, 60, 20,
  async () => {
    setAnimation("dance")
  })

export default { attack, feed, dance }
