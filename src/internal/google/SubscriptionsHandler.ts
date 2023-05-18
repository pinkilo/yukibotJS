import { youtube_v3 } from "googleapis"
import { OAuth2Client } from "google-auth-library"
import { failure, Result, successOf } from "../util"
import { Logger } from "winston"
import Schema$Subscription = youtube_v3.Schema$Subscription

export default class SubscriptionsHandler {
  private readonly client: youtube_v3.Youtube
  private readonly auth: OAuth2Client
  private readonly logger: Logger

  /** list of recent subscription history, 0 index is the MOST RECENT subscription */
  readonly history: Schema$Subscription[] = []

  constructor(client: youtube_v3.Youtube, auth: OAuth2Client, logger: Logger) {
    this.auth = auth
    this.client = client
    this.logger = logger
  }

  private get mostRecent(): Schema$Subscription {
    return this.history[0]
  }

  private timeOf(sub: Schema$Subscription): number {
    return new Date(sub.snippet.publishedAt).getTime()
  }

  /** @returns true if the given subscription is newer than the latest in history */
  private isNew(sub: Schema$Subscription): boolean {
    return (
      this.history.length === 0 ||
      this.timeOf(sub) > this.timeOf(this.mostRecent)
    )
  }

  /**
   * updates recent subscription history and returns recent subs newest->oldest
   *
   * @param {number [50]} maxResults 1-50 (will coerce numbers outside range)
   */
  async fetchRecentSubscriptions(
    maxResults = 50
  ): Promise<Result<Schema$Subscription[]>> {
    this.logger.http("fetching recent subscriptions")
    try {
      const response = await this.client.subscriptions.list({
        auth: this.auth,
        part: ["snippet", "subscriberSnippet"],
        myRecentSubscribers: true,
        // clamp value 1-50
        maxResults: Math.min(Math.max(Math.floor(maxResults || 1), 1), 50),
      })
      const newSubs = response.data.items.filter((s) => this.isNew(s))
      // add to front of history
      this.history.unshift(...newSubs)
      this.history.sort((a, b) => this.timeOf(b) - this.timeOf(a))
      return successOf(newSubs)
    } catch (err) {
      this.logger.error("failed to fetch recent subscriptions", { err })
    }
    return failure()
  }
}
