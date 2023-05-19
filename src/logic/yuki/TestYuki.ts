import Yuki from "./Yuki"
import { YukiConfig } from "./BaseYuki"
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

export default class TestYuki extends Yuki {
  private scanner = readline.createInterface({ input: stdin, output: stdout })

  constructor(
    yukiConfig: YukiConfig,
    youtube: YoutubeWrapper,
    eventbus: Eventbus,
    logger: Logger,
    userCacheLoader?: () => Promise<Record<string, User>>
  ) {
    super(
      yukiConfig,
      youtube,
      () => undefined,
      eventbus,
      logger,
      userCacheLoader
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
      "Select an event to mock:\n" +
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

  override async start(): Promise<boolean> {
    if (this.running) {
      this.logger.error("bot is already running")
      return false
    }
    this.inputWatcher().catch((err) => {
      this.logger.error("input watcher failed", { err })
      this.start()
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
