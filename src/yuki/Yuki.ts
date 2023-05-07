import { Logger } from "winston"
import { User } from "../models"
import {
  AsyncCache,
  BroadcastUpdateEvent,
  Eventbus,
  EventType,
  MessageBatchEvent,
  YoutubeWrapper,
} from "../internal"
import { failure, Result, successOf } from "../internal/util"
import { Credentials } from "google-auth-library"
import { youtube_v3 } from "googleapis"
import Schema$LiveChatMessage = youtube_v3.Schema$LiveChatMessage

export type GoogleConfig = {
  clientId: string
  clientSecret: string
  redirectUri: string
}

export type YukiConfig = {
  name: string
  chatPollRate: number
  broadcastPollRage: number
  prefix?: RegExp
}

export default class Yuki {
  private readonly config: YukiConfig
  private readonly youtube: YoutubeWrapper
  private readonly usercache: AsyncCache<User>
  private readonly eventbus: Eventbus
  private readonly tokenLoader: () => Promise<Result<Credentials>>
  private readonly logger: Logger
  private running = false

  constructor(
    yukiConfig: YukiConfig,
    youtube: YoutubeWrapper,
    tokenLoader: () => Promise<Credentials>,
    eventbus: Eventbus,
    logger: Logger
  ) {
    this.eventbus = eventbus
    this.config = yukiConfig
    this.tokenLoader = () => tokenLoader().then(successOf).catch(failure)
    this.logger = logger
    this.youtube = youtube
    this.usercache = new AsyncCache<User>(async (k) => {
      try {
        const { success, value } = await this.youtube.fetchUsers([k])
        if (success) return successOf(value[0])
      } catch (err) {
        this.logger.error("failed to fetch user", { err })
      }
      return failure()
    }, this.logger)
  }

  async start() {
    const { success, value: tokens } = await this.tokenLoader()
    if (success) {
      this.youtube.setTokens(tokens)
    }

    this.running = true
    await this.broadcastWatcher()
    this.eventbus.listen(EventType.BROADCAST_UPDATE, () => this.chatWatcher())
  }

  async stop() {
    this.running = false
  }

  async sendMessage(
    messageText: string
  ): Promise<Result<Schema$LiveChatMessage>> {
    return this.youtube.broadcasts.sendMessage(messageText)
  }

  async chatWatcher() {
    if (!this.running) return
    const { success, value } = await this.youtube.broadcasts.fetchChatMessages()
    if (success) {
      value
        .map((m) => User.fromAuthor(m.authorDetails))
        .forEach((user) => {
          this.usercache.put(user.id, user)
          this.usercache.put(user.name, user)
        })
      this.eventbus.announce(new MessageBatchEvent(value))
    }
    setTimeout(this.chatWatcher, this.config.chatPollRate)
  }

  async broadcastWatcher() {
    if (!this.running) return
    const { success, value } = await this.youtube.broadcasts.fetchBroadcast()
    if (success) this.eventbus.announce(new BroadcastUpdateEvent(value))
    setTimeout(this.broadcastWatcher, this.config.broadcastPollRage)
  }
}
