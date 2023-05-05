import yt from "./youtube"
import server from "./server"
import logger, { format, transports } from "winston"
import { enqueueNewAlert, MoneySystem, processMessage, setSocket } from "./yuki"
import ENV from "./env"
import { WebSocketServer } from "ws"
import "./testing"
import {
  AuthEvent,
  EventName,
  listen,
  MessageBatchEvent,
  SubscriberEvent,
} from "./event"
import { userCache } from "./Cache"

logger.configure({
  level: ENV.NODE_ENV === "test" ? "debug" : "info",
  transports: [new transports.Console()],
  format: format.cli(),
})

listen<AuthEvent>(EventName.AUTH, async () => logger.info("Tokens Updated"))

// process incoming messages
listen<MessageBatchEvent>(
  EventName.MESSAGE_BATCH,
  async ({ incoming, all }) => {
    if (all.length === 0) return
    if (incoming.length > 0) logger.debug("Processing Message Batch")
    incoming.forEach(processMessage)
  }
)

// save caches
listen<MessageBatchEvent>(EventName.MESSAGE_BATCH, async ({ all }) => {
  if (all.length === 0) return
  await userCache.save(ENV.FILE.CACHE.USER)
})

// alert new subscriptions
listen<SubscriberEvent>(EventName.SUBSCRIBER, async ({ subscription }) => {
  await enqueueNewAlert(
    "New Subscriber!",
    subscription.subscriberSnippet.title,
    subscription.subscriberSnippet.channelId
  )
})

async function startChatTracking() {
  const success = await yt.chat.trackChat()
  if (success) {
    listen<AuthEvent>(EventName.AUTH, () => yt.chat.trackChat())
    await enqueueNewAlert("Bot Connected", "Yuki", ENV.SELF.ID, 4)
  } else setTimeout(startChatTracking, 1000 * 60)
}

async function main() {
  logger.info(`Running in ${ENV.NODE_ENV}`)
  // load caches
  logger.info("loaded caches")
  await userCache.load(ENV.FILE.CACHE.USER)
  await MoneySystem.walletCache.load(ENV.FILE.CACHE.BANK)
  await yt.auth.loadTokens()

  // things not to do in test mode
  if (ENV.TEST) {
    // track chat
    await startChatTracking()
    // start sub watcher
    await yt.subscriptions.updateSubscriptionsLoop()
  }

  const svr = server().listen(ENV.PORT, () =>
    logger.info(`http://localhost:${ENV.PORT}`)
  )

  setSocket(new WebSocketServer({ server: svr, path: "/fox" }))
}

export default main
