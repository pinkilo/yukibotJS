import Command from "./Command"
import yt from "../../youtube"
import logger from "winston"

type Socials = "discord" | "twitter" | "youtube"
export default new Command(
  "discord", ["twitter", "youtube"], 0, 60,
  async (_, { command }) => {
    let outMsg: string
    switch (command as Socials) {
      case "discord":
        outMsg = `Check out the NL Discord! Followers & Subs get special roles 
                  ooo *special* you know u want it ( ͡° ͜ʖ ͡°) 
                  https://discord.gg/3dYzJXJStR`
        break
      case "twitter":
        outMsg = `Follow Jono on twitter! https://twitter.com/JonoDieEnte`
        break
      case "youtube":
        outMsg = `Like fish and aquariums? Like looking at my face? Well if you 
         do, make sure to check out my other channel, Aquatic Mastery! 
         https://www.youtube.com/aquaticmaster`
        break
    }
    const failed = await yt.chat.sendMessage(outMsg)
    if (failed) logger.error("Failed to send message")
  },
)
