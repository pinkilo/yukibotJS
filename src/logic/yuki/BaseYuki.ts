import { youtube_v3 } from "googleapis"
import {
  AsyncCache,
  AuthEvent,
  CallRecord,
  Eventbus,
  EventType,
  Result,
  YoutubeWrapper,
} from "../../internal"
import { User } from "../../models"
import { Logger } from "winston"
import { Credentials } from "google-auth-library"
import Schema$LiveChatMessage = youtube_v3.Schema$LiveChatMessage
import Schema$Subscription = youtube_v3.Schema$Subscription


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

  /** A record of each API call made, most recent -> oldest */
  get ytApiCallHistory(): CallRecord[] {
    return this.youtube.callHistory
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
    if (this.youtube.broadcasts.broadcast === undefined) {
      this.logger.error("message cannot be sent without an active broadcast")
      return undefined
    }
    return this.youtube.broadcasts.sendMessage(messageText)
  }
}
