import yt from "./youtube"
import server from "./server"
import logger, { format, transports } from "winston"
import { MoneySystem, processMessage, setSocket } from "./yuki"
import env from "./env"
import { WebSocketServer } from "ws"
import "./testing"
import { AuthEvent, EventName, listen, MessageBatchEvent } from "./event"

logger.configure({
  level: process.env.STAGE = "debug",
  transports: [new transports.Console()],
  format: format.simple(),
})

async function main() {
  listen<AuthEvent>(EventName.AUTH, async () => logger.info("Tokens Updated"))

  await MoneySystem.loadBank()
  await yt.auth.loadTokens()

  if (env.NODE_ENV !== "test") {
    await yt.chat.trackChat()
    listen<AuthEvent>(EventName.AUTH, () => yt.chat.trackChat())
    //await yt.chat.sendMessage("Yuki is Here!")
  }

  listen<MessageBatchEvent>(EventName.MESSAGE_BATCH, async ({ incoming, all }) => {
    if (all.length === 0) return
    if (incoming.length > 0) logger.debug("Processing Message Batch")
    incoming.forEach(processMessage)
  })

  const svr = server()
    .listen(env.PORT, () => logger.info(`http://localhost:${ env.PORT }`))

  setSocket(new WebSocketServer({ server: svr, path: "/fox" }))
}

export default main
