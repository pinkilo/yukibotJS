import yt from "./youtube"
import server from "./server"
import { processMessage } from "./yuki"
import * as console from "console"
import logger, { transports, format } from "winston"
import { MoneySystem } from "./yuki"

// Configure Logger
logger.configure({
  level: process.env.STAGE = "debug",
  transports: [new transports.Console()],
  format: format.simple(),
})

async function main() {
  yt.auth.onTokenUpdate(() => console.log("Tokens Updated"))
  yt.auth.onTokenUpdate(() => yt.chat.trackChat())
  yt.chat.onChatUpdate((incoming) => {
    if (incoming.length > 0) console.log("Processing Message Batch")
    incoming.forEach(processMessage)
  })

  await yt.auth.loadTokens()
  await MoneySystem.loadBank()

  server().listen(3000, () => console.log("http://localhost:3000"))
}

export default main
