import { youtube_v3 } from "googleapis"
import { OAuth2Client } from "google-auth-library"
import { failure, Result, successOf } from "../util"
import { Logger } from "winston"
import Schema$Subscription = youtube_v3.Schema$Subscription

export default class SubscriptionsHandler {
  private readonly client: youtube_v3.Youtube
  private readonly auth: OAuth2Client
  private readonly logger: Logger

  /** Set of recent subscription IDs */
  private readonly subscriptionSet: Set<string> = new Set()
  /** list of recent subscription history, 0 index is the MOST RECENT subscription */
  readonly history: Schema$Subscription[] = []

  constructor(client: youtube_v3.Youtube, auth: OAuth2Client, logger: Logger) {
    this.auth = auth
    this.client = client
    this.logger = logger
  }

  /** updates recent subscription history and returns recent subs newest->oldest */
  async fetchRecentSubscriptions(): Promise<Result<Schema$Subscription[]>> {
    this.logger.http("fetching recent subscriptions")
    try {
      const response = await this.client.subscriptions.list({
        auth: this.auth,
        part: ["snippet", "subscriberSnippet"],
        myRecentSubscribers: true,
      })
      /** subs not already in memory */
      const newSubs = response.data.items.filter(
        (s) => !this.subscriptionSet.has(s.id)
      )
      // add to front of history
      this.history.unshift(...newSubs)
      newSubs.map((s) => s.id).forEach((id) => this.subscriptionSet.add(id))
      return successOf(newSubs)
    } catch (err) {
      this.logger.error("failed to fetch recent subscriptions", { err })
    }
    return failure()
  }
}
