import { Logger } from "winston"
import { User } from "../../models"
import {
  AsyncCache,
  attempt,
  AuthEvent,
  BroadcastUpdateEvent,
  Eventbus,
  EventType,
  failure,
  MessageBatchEvent,
  Result,
  SubscriptionEvent,
  successOf,
  YoutubeWrapper,
} from "../../internal"
import { Credentials } from "google-auth-library"
import express, { Express } from "express"
import nunjucks from "nunjucks"
import { join } from "path"
import BaseYuki, { YukiConfig } from "./BaseYuki"

export default class Yuki extends BaseYuki {
  protected readonly tokenLoader: () => Promise<Result<Credentials>>
  protected running = false

  readonly config: YukiConfig
  readonly express: Express = express()
    .get("/", (_, res) => res.render("index.njk", this.pageData))
    .get("/auth", (_, res) => res.redirect(this.youtube.getAuthUrl()))
    .get("/callback", async (req, res) => {
      const code = req.query.code as string
      this.logger.http("auth code received")
      const { success, value } = await this.youtube.fetchTokensWithCode(code)
      if (success) {
        await this.youtube.setTokens(value)
        await this.eventbus.announce(new AuthEvent(value))
      }
      res.redirect("/")
    })

  constructor(
    yukiConfig: YukiConfig,
    youtube: YoutubeWrapper,
    tokenLoader: () => Promise<Credentials>,
    eventbus: Eventbus,
    logger: Logger,
    usercache: AsyncCache<User>
  ) {
    super()
    this.eventbus = eventbus
    this.config = yukiConfig
    this.logger = logger
    this.youtube = youtube
    this.usercache = usercache

    nunjucks.configure(join(__dirname, "../../views"), {
      express: this.express,
    })

    this.tokenLoader = async () => {
      const { success, value } = await attempt(
        tokenLoader,
        "supplied token loader failed"
      )
      if (!success) {
        this.logger.error("supplied token loader failed")
        return failure()
      }
      if (value === undefined || value === null) {
        this.logger.error("supplied token loader returned undefined or null")
        return failure()
      }
      if (!("expiry_date" in value) || typeof value.expiry_date !== "number") {
        this.logger.error(`supplied token loader is missing "expiry_date"`)
        return failure()
      }
      const keys = ["refresh_token", "access_token", "token_type", "scope"]
      for (const k of keys) {
        if (
          !(k in value) ||
          typeof value[k] !== "string" ||
          (value[k] as string).length === 0
        ) {
          this.logger.error(`supplied token loader is missing "${k}"`)
          return failure()
        }
      }

      return successOf(value)
    }
  }

  private get pageData() {
    return {
      config: this.config,
      listeners: this.eventbus.size,
      userCacheSize: this.usercache.values.length / 2,
    }
  }

  private async chatWatcher() {
    if (!this.running) return
    const { success, value } = await this.youtube.broadcasts.fetchChatMessages()
    if (success && value.length > 0) {
      value
        .map((m) => User.fromAuthor(m.authorDetails))
        .forEach((user) => {
          this.usercache.put(user.id, user)
          this.usercache.put(user.name, user)
        })
      await this.eventbus.announce(new MessageBatchEvent(value))
    }
    setTimeout(() => this.chatWatcher(), this.config.chatPollRate)
  }

  private async broadcastWatcher() {
    if (!this.running) return
    const { success, value } = await this.youtube.broadcasts.fetchBroadcast()
    if (success) await this.eventbus.announce(new BroadcastUpdateEvent(value))
    else this.logger.info("no active broadcast found")
    setTimeout(() => this.broadcastWatcher(), this.config.broadcastPollRate)
  }

  private async subscriptionWatcher() {
    if (!this.running) return
    const { success, value } =
      await this.youtube.subscriptions.fetchRecentSubscriptions(50)
    if (success) {
      for (const sub of value) {
        await this.eventbus.announce(new SubscriptionEvent(sub))
      }
    }
    setTimeout(
      () => this.subscriptionWatcher(),
      this.config.subscriptionPollRate
    )
  }

  async start(): Promise<boolean> {
    if (this.running) {
      this.logger.error("bot is already running")
      return false
    } else if (!this.youtube.tokensLoaded) {
      this.logger.debug("auth tokens not loaded. attempting to use tokenLoader")
      const { success, value: tokens } = await this.tokenLoader()
      if (success) {
        this.logger.debug("auth tokens loaded")
        this.youtube.setTokens(tokens)
      } else {
        this.logger.info("no auth token available from token loader")
        return false
      }
    }
    this.running = true
    await this.broadcastWatcher()
    // fetch recent history, so that only
    // subscriptions during runtime are announced
    await this.youtube.subscriptions.fetchRecentSubscriptions(1)
    await this.subscriptionWatcher()
    this.eventbus.listen(EventType.BROADCAST_UPDATE, () => this.chatWatcher())
    return true
  }

  async stop() {
    this.running = false
  }
}
