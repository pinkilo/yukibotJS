import Yuki from "./Yuki"
import { RouteConfig, YukiConfig } from "./BaseYuki"
import {
  AuthEvent,
  createMessage,
  Event,
  Eventbus,
  MessageBatchEvent,
  Result,
  SubscriptionEvent,
  successOf,
  YoutubeWrapper,
} from "../../internal"
import { Logger } from "winston"
import { youtube_v3 } from "googleapis"
import * as readline from "readline/promises"
import { stdin, stdout } from "process"
import { User } from "../../models"
import Schema$LiveChatMessage = youtube_v3.Schema$LiveChatMessage
import { Credentials } from "google-auth-library"

export default class TestYuki extends Yuki {
  private scanner = readline.createInterface({ input: stdin, output: stdout })

  constructor(
    yukiConfig: YukiConfig,
    youtube: YoutubeWrapper,
    tokenLoader: () => Promise<Credentials>,
    eventbus: Eventbus,
    logger: Logger,
    userCacheLoader?: () => Promise<Record<string, User>>,
    routes?: RouteConfig
  ) {
    super(
      yukiConfig,
      youtube,
      tokenLoader,
      eventbus,
      logger,
      userCacheLoader,
      routes
    )
  }

  private async mockMessage(): Promise<MessageBatchEvent | undefined> {
    const text = await this.scanner.question("message text (empty to cancel):")
    if (text.trim().length <= 0) {
      return undefined
    }
    return new MessageBatchEvent([createMessage(text)])
  }

  private mockSubscription(): SubscriptionEvent {
    return new SubscriptionEvent({
      kind: "youtube#subscription",
      etag: "ENTITY_TAG",
      id: "SUBSCRIPTION_ID",
      subscriberSnippet: {
        title: "CHANNEL_TITLE",
        description: "CHANNEL_DESCRIPTION",
        channelId: "CHANNEL_ID",
        thumbnails: {
          default: { url: "" },
          medium: { url: "" },
          high: { url: "" },
        },
      },
    })
  }

  private async inputWatcher() {
    console.log(
      "\n\nSelect an event to mock:\n" +
        "1: new message\n" +
        "2: new subscription\n" +
        "3: auth/token update\n" +
        "0: exit"
    )
    const answer = parseInt(await this.scanner.question("choice:"))
    let event: Event
    switch (answer) {
      case 0:
        process.exit(0)
        break
      case 1:
        event = await this.mockMessage()
        break
      case 2:
        event = this.mockSubscription()
        break
      case 3:
        event = new AuthEvent(this.youtube.credentials)
        break
      default:
        this.logger.error(`"${answer}" is not a valid choice`)
    }
    if (event) await this.eventbus.announce(event)
    setTimeout(() => this.inputWatcher())
  }

  async feedMessage(text: string) {
    await this.eventbus.announce(new MessageBatchEvent([createMessage(text)]))
  }

  async feedSubscription() {
    await this.eventbus.announce(this.mockSubscription())
  }

  async feedAuthUpdate() {
    await this.eventbus.announce(new AuthEvent(this.youtube.credentials))
  }

  override async start(): Promise<boolean> {
    const loaders = await this.setup()
    if (!loaders) return false
    this.inputWatcher().catch((err) => {
      this.logger.error("input watcher failed", { err })
      this.restart()
    })
    this.running = true
    return true
  }

  override async sendMessage(
    messageText: string
  ): Promise<Result<Schema$LiveChatMessage>> {
    this.logger.info(`mock message send: "${messageText}"`)
    return successOf(createMessage(messageText))
  }
}
