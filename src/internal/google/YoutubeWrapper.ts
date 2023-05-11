import { Logger } from "winston"
import { google, youtube_v3 } from "googleapis"
import { Credentials, OAuth2Client } from "google-auth-library"
import BroadcastHandler from "./BroadcastHandler"
import { User } from "../../models"
import { failure, Result, successOf } from "../util"
import SubscriptionsHandler from "./SubscriptionsHandler"

export default class YoutubeWrapper {
  private readonly client: youtube_v3.Youtube
  private readonly auth: OAuth2Client
  private readonly logger: Logger

  readonly broadcasts: BroadcastHandler
  readonly subscriptions: SubscriptionsHandler

  constructor(
    clientId: string,
    clientSecret: string,
    redirectUri: string,
    logger: Logger
  ) {
    this.logger = logger
    this.auth = new google.auth.OAuth2(clientId, clientSecret, redirectUri)
    this.client = google.youtube("v3")
    this.broadcasts = new BroadcastHandler(this.client, this.auth, this.logger)
    this.subscriptions = new SubscriptionsHandler(
      this.client,
      this.auth,
      this.logger
    )
  }

  get tokensLoaded(): boolean {
    return this.auth.credentials !== undefined
  }

  setTokens(tokens: Credentials) {
    this.auth.setCredentials(tokens)
  }

  async fetchTokensWithCode(code: string): Promise<Result<Credentials>> {
    this.logger.http("fetching token with code")
    try {
      const credentials = await this.auth.getToken(code)
      return successOf(credentials.tokens)
    } catch (err) {
      this.logger.error("failed to fetch token with code", { err })
    }
    return failure()
  }

  getAuthUrl(): string {
    this.logger.http("fetching auth url")
    return this.auth.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/youtube.readonly",
        "https://www.googleapis.com/auth/youtube",
        "https://www.googleapis.com/auth/youtube.force-ssl",
      ],
    })
  }

  async fetchUsers(uid: string[]): Promise<Result<User[]>> {
    this.logger.http(`fetching channels ${uid}`)
    try {
      const result = await this.client.channels.list({
        id: uid,
        part: ["snippet"],
        auth: this.auth,
      })
      return successOf(result.data.items.map((c) => User.fromChannel(c)) || [])
    } catch (err) {
      this.logger.error("failed to fetch channels", { err })
    }
    return failure()
  }
}
