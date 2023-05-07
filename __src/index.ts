import yt from "./youtube"
import server from "./server"
import logger, { format, transports } from "winston"
import { MoneySystem } from "./yuki"
import ENV from "./env"
import "./testing"
import { AuthEvent, EventName, listen, MessageBatchEvent } from "./event"

logger.configure({
  level: ENV.NODE_ENV === "test" ? "debug" : "info",
  transports: [new transports.Console()],
  format: format.cli(),
})

listen<AuthEvent>(EventName.AUTH, async () => logger.info("Tokens Updated"))

// save caches
listen<MessageBatchEvent>(EventName.MESSAGE_BATCH, async ({ all }) => {
  if (all.length === 0) return
  await yt.users.userCache.save(ENV.FILE.CACHE.USER)
})

async function startChatTracking() {
  const success = await yt.chat.trackChat()
  if (success) listen<AuthEvent>(EventName.AUTH, () => yt.chat.trackChat())
  else {
    logger.error("failed to find live broadcast, trying in 60 sec")
    setTimeout(startChatTracking, 1000 * 60)
  }
}

async function main() {
  logger.info(`Running in ${ENV.NODE_ENV}`)
  // load caches
  logger.info("loaded caches")
  await yt.users.userCache.load(ENV.FILE.CACHE.USER)
  await MoneySystem.walletCache.load(ENV.FILE.CACHE.BANK)
  await yt.auth.loadTokens()

  // things not to do in test mode
  if (!ENV.TEST) {
    // track chat
    await startChatTracking()
    // start sub watcher
    await yt.subscriptions.updateSubscriptionsLoop()
  }

  const svr = server().listen(ENV.PORT, () =>
    logger.info(`http://localhost:${ENV.PORT}`)
  )
}

export default main
