import yt from "./youtube"
import server from "./server"
import logger, { format, transports } from "winston"
import { MoneySystem, processMessage } from "./yuki"

// Configure Logger
logger.configure({
  level: process.env.STAGE = "debug",
  transports: [new transports.Console()],
  format: format.simple(),
})

async function main() {
  yt.auth.onTokenUpdate(() => logger.debug("Tokens Updated"))
  yt.auth.onTokenUpdate(() => yt.chat.trackChat())

  await MoneySystem.loadBank()
  //await yt.auth.loadTokens()
  //await yt.chat.sendMessage("Yuki is Here!")

  yt.chat.onChatUpdate((incoming) => {
    if (incoming.length > 0) logger.debug("Processing Message Batch")
    incoming.forEach(processMessage)
  })

  server().listen(3000, () => logger.info("http://localhost:3000"))
}

export default main
