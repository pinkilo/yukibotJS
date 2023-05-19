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
  protected readonly userCacheLoader: () => Promise<
    Result<Record<string, User>>
  >
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
    userCacheLoader?: () => Promise<Record<string, User>>
  ) {
    super()
    this.eventbus = eventbus
    this.config = yukiConfig
    this.logger = logger
    this.youtube = youtube
    this.tokenLoader = this.wrapTokenLoader(tokenLoader)
    if (userCacheLoader !== undefined) {
      this.userCacheLoader = this.wrapUserCacheLoader(userCacheLoader)
    }

    nunjucks.configure(join(__dirname, "../../views"), {
      express: this.express,
    })
  }

  private wrapTokenLoader(
    inner: () => Promise<Credentials>
  ): () => Promise<Result<Credentials>> {
    return async () => {
      const { success, value } = await attempt(
        inner,
        "supplied token loader failed"
      )
      if (!success) {
        this.logger.error("supplied token loader failed")
        return failure()
      }
      let failed = false
      if (value === undefined || value === null) {
        this.logger.error("supplied token loader returned undefined or null")
        return failure()
      }
      if (!("expiry_date" in value) || typeof value.expiry_date !== "number") {
        this.logger.error(`supplied token loader is missing "expiry_date"`)
        failed = true
      }
      if (
        !("refresh_token" in value) ||
        typeof value.refresh_token !== "string"
      ) {
        this.logger.error(`supplied token loader is missing "refresh_token"`)
        failed = true
      }
      if (
        !("access_token" in value) ||
        typeof value.access_token !== "string"
      ) {
        this.logger.error(`supplied token loader is missing "access_token"`)
        failed = true
      }
      if (!("token_type" in value) || typeof value.token_type !== "string") {
        this.logger.error(`supplied token loader is missing "token_type"`)
        failed = true
      }
      if (!("scope" in value) || typeof value.scope !== "string") {
        this.logger.error(`supplied token loader is missing "scope"`)
        failed = true
      }
      return failed ? failure() : successOf(value)
    }
  }

  private wrapUserCacheLoader(
    inner: () => Promise<Record<string, User>>
  ): () => Promise<Result<Record<string, User>>> {
    return async () => {
      const { success, value } = await attempt(
        inner,
        "supplied user cache loader failed"
      )
      if (!success) return failure()
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
      if (!success) {
        this.logger.info("no auth token available from token loader")
        return false
      }
      this.logger.debug("auth tokens loaded")
      this.youtube.setTokens(tokens)
    }
    if (this.userCacheLoader !== undefined) {
      this.logger.info("attempting user cache loading")
      const { success, value } = await this.userCacheLoader()
      if (!success) {
        this.logger.warn("user cache loader failed")
        // don't fail here, since this isn't a fatal error
      }
      this.logger.debug("user cache loaded")
      this.usercache = new AsyncCache<User>(
        async (k) => {
          const { success, value } = await this.youtube.fetchUsers([k])
          if (success) return successOf(value[0])
          this.logger.error(`failed to fetch user ${k}`)
          return failure()
        },
        this.logger,
        value || {}
      )
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
