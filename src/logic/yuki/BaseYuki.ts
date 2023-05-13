import { youtube_v3 } from "googleapis"
import {
  AsyncCache,
  AuthEvent,
  Eventbus,
  EventType,
  Result,
  YoutubeWrapper,
} from "../../internal"
import { User } from "../../models"
import { Logger } from "winston"
import Schema$LiveChatMessage = youtube_v3.Schema$LiveChatMessage
import Schema$Subscription = youtube_v3.Schema$Subscription
import { Credentials } from "google-auth-library"

export type GoogleConfig = {
  clientId: string
  clientSecret: string
  redirectUri: string
}

export type YukiConfig = {
  name: string
  chatPollRate: number
  broadcastPollRate: number
  subscriptionPollRate: number
  prefix?: RegExp
  test?: boolean
}

export default abstract class BaseYuki {
  protected eventbus: Eventbus
  protected usercache: AsyncCache<User>
  protected youtube: YoutubeWrapper
  protected logger: Logger

  /**
   * @returns a list of recent subscriptions in order of creation.
   * `0` index being the most recent.
   */
  get recentSubscriptions(): Schema$Subscription[] {
    return this.youtube.subscriptions.history
  }

  get cachedUsers(): User[] {
    return this.usercache.values
  }

  /** The entire chat history */
  get chatHistory(): Schema$LiveChatMessage[] {
    return this.youtube.broadcasts.chatPage(0)
  }

  /**
   * Get the chat history from start to end (end not included).
   *
   * @param start
   * @param end optional end index. When 0 or undefined this will return
   *            the whole history from the start index
   */
  getChatFrom(start: number, end?: number): Schema$LiveChatMessage[] {
    return this.youtube.broadcasts.chatPage(start, Math.max(end, 0))
  }

  /**
   * Attempts to get a user from cache or else fetches user.
   */
  getUser(uid: string): Promise<User | undefined> {
    return this.usercache.get(uid)
  }

  /**
   * Called when auth tokens are updated.
   *
   * usually useful when waiting on login to start the bot
   */
  onAuthUpdate<T = unknown>(
    listener: (credentials: Credentials) => T,
    deathPredicate?: (credentials: Credentials, value: T) => Promise<boolean>
  ) {
    this.eventbus.listen<AuthEvent>(EventType.AUTH, async (e, self) => {
      const value = await listener(e.credentials)
      if (deathPredicate && (await deathPredicate(e.credentials, value)))
        self.remove()
    })
  }

  async sendMessage(
    messageText: string
  ): Promise<Result<Schema$LiveChatMessage>> {
    return this.youtube.broadcasts.sendMessage(messageText)
  }
}
