import Command from "./Command"
import yt from "../../youtube"

type BeanType = "bean" | "🫘" | "beans";

export const Beans = new Command(
  "bean", ["🫘", "beans"], 0,
  async (_, { command }) => {
    let msg: string
    switch (command as BeanType) {
      case "bean":
        msg = "🫘"
        break
      case "beans":
        msg = "🫘".repeat(Math.random() * 10)
        break
      case "🫘":
        msg = "bean!"
        break
    }
    await yt.chat.sendMessage(msg)
  },
)
