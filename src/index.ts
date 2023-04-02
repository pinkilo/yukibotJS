import yt from "./youtube"
import server from "./server"
import logger, { format, transports } from "winston"
import { MoneySystem, processMessage, setSocket } from "./yuki"
import env from "./env"
import { WebSocketServer } from "ws"
import "./testing"

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
  if (env.NODE_ENV !== "test") {
    await yt.auth.loadTokens()
    await yt.chat.sendMessage("Yuki is Here!")
  }

  yt.chat.onChatUpdate((incoming) => {
    if (incoming.length > 0) logger.debug("Processing Message Batch")
    incoming.forEach(processMessage)
  })

  const svr = server()
    .listen(env.PORT, () => logger.info(`http://localhost:${ env.PORT }`))
  setSocket(new WebSocketServer({ server: svr, path: "/fox" }))
}

export default main
