import { Subscription } from "../types/google"
import ytApi, { basePollingRate } from "./apiClient"
import auth from "./auth"
import { file } from "../util"
import Env from "../env"
import { announce, EventName, SubscriberEvent } from "../event"
import logger from "winston"

let lastSub: Subscription

export const loadLastSub = async () => {
  if (!file.exists(Env.FILE.SUBSCRIBER)) return
  const raw = await file.read(Env.FILE.SUBSCRIBER)
  lastSub = JSON.parse(raw + "")
}

/**
 * Subscribers in reverse chronological order (newest first)
 */
const getRecentSubscribers = async (): Promise<Subscription[]> => {
  return (
    await ytApi.subscriptions.list({
      auth,
      part: ["subscriberSnippet"],
      myRecentSubscribers: true,
    })
  ).data.items
}

/**
 * Update lastSub cache and announce subscriber event
 */
const updateLastSub = async (sub: Subscription) => {
  lastSub = sub
  await file.write(Env.FILE.SUBSCRIBER, JSON.stringify(sub))
  announce<SubscriberEvent>({
    name: EventName.SUBSCRIBER,
    subscription: sub,
  })
}

export const checkSubscriptions = async (loop: boolean = true) => {
  logger.info("checking subscriptions")
  const recent = await getRecentSubscribers()
  logger.debug("recent subs", { recent: recent.length })
  let updated: Subscription[]
  if (lastSub && recent.map((s) => s.id).includes(lastSub.id)) {
    updated = recent.slice(recent.findIndex((s) => s.id == lastSub.id) + 1)
  } else {
    updated = recent
  }
  logger.debug("new subs", { newsubs: updated.length })
  for (const sub of updated) {
    await updateLastSub(sub)
  }
  if (loop) setTimeout(checkSubscriptions, basePollingRate * 4)
}
