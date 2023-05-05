import { Subscription } from "../types/google"
import ytApi, { basePollingRate } from "./apiClient"
import auth from "./auth"
import { file } from "../util"
import Env from "../env"
import { announce, SubscriberEvent } from "../event"
import logger from "winston"

let _lastSub: Subscription = null

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
 * @returns the most recent subscriber, will attempt to load from file if not in memory.
 */
const getMostRecentSub = async (): Promise<Subscription> => {
  // if null check file
  if (_lastSub === null && file.exists(Env.FILE.SUBSCRIBER)) {
    logger.debug("loading most recent sub from file")
    const raw = await file.read(Env.FILE.SUBSCRIBER)
    _lastSub = JSON.parse(raw + "")
  }
  return _lastSub
}

const updateSubscriptionsLoop = async (loop: boolean = true) => {
  logger.info("checking subscriptions")
  const lastInMem = await getMostRecentSub()
  const recent = await getRecentSubscribers()
  logger.debug("recent subs", { recent: recent.length })

  let updated: Subscription[]
  // if there is a sub in mem, skip it
  if (lastInMem !== null && recent.map((s) => s.id).includes(lastInMem.id)) {
    updated = recent.slice(recent.findIndex((s) => s.id == lastInMem.id) + 1)
  } else {
    updated = recent
  }
  logger.debug("new subs", { newsubs: updated.length })

  if (updated.length > 0) {
    // announce oldest->newest
    updated
      .reverse()
      .map((s) => new SubscriberEvent(s))
      .forEach(announce)
    // save most recent
    _lastSub = updated[0]
    await file.write(Env.FILE.SUBSCRIBER, JSON.stringify(updated[0]))
  }
  if (loop) setTimeout(updateSubscriptionsLoop, basePollingRate * 4)
}

export { updateSubscriptionsLoop, getMostRecentSub }
