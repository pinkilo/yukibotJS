import { youtube_v3 } from "googleapis"
import { OAuth2Client } from "google-auth-library"
import { Logger } from "winston"
import { failure, Result, successOf } from "../util"
import Schema$LiveChatMessage = youtube_v3.Schema$LiveChatMessage
import Schema$LiveBroadcast = youtube_v3.Schema$LiveBroadcast

export default class BroadcastHandler {
  private readonly client: youtube_v3.Youtube
  private readonly auth: OAuth2Client
  private readonly logger: Logger

  private broadcast: Schema$LiveBroadcast | undefined
  private chatHistory: Schema$LiveChatMessage[] = []
  private chatNextPage: string

  constructor(client: youtube_v3.Youtube, auth: OAuth2Client, logger: Logger) {
    this.auth = auth
    this.client = client
    this.logger = logger
  }

  private get liveChatID(): string | undefined {
    return this.broadcast?.snippet?.liveChatId
  }

  chatPage(index: number, max = 0): Schema$LiveChatMessage[] {
    return this.chatHistory.slice(
      index,
      max > 0 ? index + max + 1 : this.chatHistory.length
    )
  }

  /**
   * Fetches active broadcast and updates broadcast data in memory
   * TODO Find a way to handle multiple broadcasts?
   */
  async fetchBroadcast(): Promise<Result<Schema$LiveBroadcast>> {
    this.logger.http("fetching active broadcast")
    try {
      const response = await this.client.liveBroadcasts.list({
        auth: this.auth,
        part: ["snippet"],
        broadcastStatus: "active",
        broadcastType: "all",
      })
      if (response.data.items.length > 0) {
        this.broadcast = response.data.items[0]
        return successOf(response.data.items[0])
      }
    } catch (err) {
      this.logger.error("failed to fetch broadcast", { err })
    }
    return failure()
  }

  /**
   * Retrieves any new chat messages and updates chat history
   *
   * @returns a list of new messages
   */
  async fetchChatMessages(): Promise<Result<Schema$LiveChatMessage[]>> {
    this.logger.http("fetching chat messages")
    try {
      const response = await this.client.liveChatMessages.list({
        auth: this.auth,
        part: ["snippet", "authorDetails"],
        liveChatId: this.liveChatID,
        pageToken: this.chatNextPage,
      })
      this.chatNextPage = response.data.nextPageToken
      const newMessages = response.data.items
      this.chatHistory.push(...newMessages)
      return successOf(newMessages)
    } catch (err) {
      this.logger.error("failed to fetch chat messages", { err })
    }
    return failure()
  }

  /**
   * Sends a chat message. returns the chat message on success
   * @param messageText the text of the message to send
   */
  async sendMessage(
    messageText: string
  ): Promise<Result<Schema$LiveChatMessage>> {
    this.logger.http("sending chat message")
    try {
      const response = await this.client.liveChatMessages.insert({
        auth: this.auth,
        part: ["snippet"],
        requestBody: {
          snippet: {
            liveChatId: this.liveChatID,
            type: "textMessageEvent",
            textMessageDetails: {
              messageText,
            },
          },
        },
      })
      return successOf(response.data)
    } catch (err) {
      this.logger.error("failed to send new chat message", { err })
    }
    return failure()
  }
}
