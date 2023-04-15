import Command from "./Command"
import yt from "../../youtube"
import { randFromRange } from "../../util"

type BeanType = "bean" | "🫘" | "beans"

export const Beans = new Command(
  "bean",
  ["🫘", "beans"],
  0,
  120,
  0,
  async (_, { command }) => {
    let msg: string
    switch (command as BeanType) {
      case "bean":
        msg = "🫘"
        break
      case "beans":
        msg = "🫘".repeat(randFromRange(1, 10))
        break
      case "🫘":
        msg = "bean!"
        break
    }
    await yt.chat.sendMessage(msg)
  }
)
