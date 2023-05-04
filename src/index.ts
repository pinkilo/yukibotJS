import yt from "./youtube"
import server from "./server"
import logger, { format, transports } from "winston"
import { MoneySystem, processMessage, setSocket } from "./yuki"
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
import { addAlert } from "./yuki/Alerts"
import { checkSubscriptions } from "./youtube/subscriber"

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
  await addAlert({
    description: "New Subscriber!",
    redeemer: {
      name: subscription.subscriberSnippet.title,
      id: subscription.subscriberSnippet.channelId,
    },
    durationSec: 10,
  })
})

async function startChatTracking() {
  const success = await yt.chat.trackChat()
  if (success) {
    listen<AuthEvent>(EventName.AUTH, () => yt.chat.trackChat())
    await addAlert({
      description: "Bot Connected",
      redeemer: { name: "Yuki", id: "" },
      durationSec: 3,
    })
  } else setTimeout(startChatTracking, 1000 * 60)
}

async function main() {
  logger.info(`Running in ${ENV.NODE_ENV}`)
  // load caches
  logger.info("loaded caches")
  await userCache.load(ENV.FILE.CACHE.USER)
  await MoneySystem.walletCache.load(ENV.FILE.CACHE.BANK)
  await yt.subscriber.loadLastSub()
  await yt.auth.loadTokens()

  // things not to do in test mode
  if (ENV.NODE_ENV !== "test") {
    // track chat
    await startChatTracking()
    // start sub watcher
    await checkSubscriptions()
  }

  const svr = server().listen(ENV.PORT, () =>
    logger.info(`http://localhost:${ENV.PORT}`)
  )

  setSocket(new WebSocketServer({ server: svr, path: "/fox" }))
}

export default main
