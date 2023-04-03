import Command from "./Command"
import { setAnimation } from "../fox"

const attack = new Command(
  "attack", [], 5, 60, 20,
  async (msg) => {
    setAnimation("attack", msg.authorDetails.displayName)
  })

export default { attack }
