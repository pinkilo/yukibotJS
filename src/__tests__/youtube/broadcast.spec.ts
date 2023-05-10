import { google, youtube_v3 } from "googleapis"
import { OAuth2Client } from "google-auth-library"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import winston from "winston"
import BroadcastHandler from "../../internal/google/BroadcastHandler"
import { chatMessage, gaxiosResponse, listOf } from "../util"
import Schema$LiveBroadcast = youtube_v3.Schema$LiveBroadcast
import Schema$LiveBroadcastListResponse = youtube_v3.Schema$LiveBroadcastListResponse

jest.mock("google-auth-library")

const sampleText = "text"
let ytClient: youtube_v3.Youtube
let auth: OAuth2Client
let logger: winston.Logger
let broadcastHandler: BroadcastHandler

beforeEach(() => {
  logger = winston.createLogger()
  auth = new OAuth2Client()
  ytClient = google.youtube("v3")
  broadcastHandler = new BroadcastHandler(ytClient, auth, logger)
})

describe("send message", () => {
  let messageInsertSpy: jest.SpyInstance
  let messageInsertParams
  beforeEach(() => {
    messageInsertParams = {
      auth: auth,
      part: ["snippet"],
      requestBody: {
        snippet: {
          liveChatId: undefined,
          type: "textMessageEvent",
          textMessageDetails: {
            messageText: sampleText,
          },
        },
      },
    }
    messageInsertSpy = jest
      .spyOn(ytClient.liveChatMessages, "insert")
      .mockName("liveChatMessages.insert spy")
      .mockImplementation(() => gaxiosResponse(chatMessage(sampleText), 200))
  })
  it("should insert new chat message", async () => {
    await broadcastHandler.sendMessage("text")
    expect(messageInsertSpy).toHaveBeenCalledTimes(1)
    expect(messageInsertSpy).toHaveBeenCalledWith(messageInsertParams)
  })
  it("should return the created message", async () => {
    const { success, value } = await broadcastHandler.sendMessage("text")
    expect(success).toBe(true)
    expect(value).toBeDefined()
    expect(value).toHaveProperty("snippet")
    expect(value.snippet).toHaveProperty("displayMessage")
    expect(value.snippet.displayMessage).toEqual(sampleText)
  })
  it("should handle failed requests", async () => {
    const err = new Error(sampleText)
    messageInsertSpy = jest
      .spyOn(ytClient.liveChatMessages, "insert")
      .mockName("liveChatMessages.insert spy")
      .mockImplementation(() => {
        throw err
      })
    const { success, value } = await broadcastHandler.sendMessage("text")
    expect(success).toBe(false)
    expect(value).toBeUndefined()
    expect(logger.error).toHaveBeenCalledTimes(1)
    expect(logger.error).toHaveBeenCalledWith(
      "failed to send new chat message",
      { err }
    )
  })
})
describe("fetch broadcast", () => {
  let broadcastListParams
  const sampleChatId = "chat_id"
  let broadcastListSpy: jest.SpyInstance
  const broadcasts: Schema$LiveBroadcast[] = [
    {
      snippet: {
        liveChatId: sampleChatId,
      },
    },
    {
      snippet: {
        liveChatId: sampleChatId + "_2",
      },
    },
  ]
  beforeEach(() => {
    broadcastListParams = {
      auth: auth,
      part: ["snippet"],
      broadcastStatus: "active",
      broadcastType: "all",
    }
    broadcastListSpy = jest
      .spyOn(ytClient.liveBroadcasts, "list")
      .mockImplementation(() =>
        gaxiosResponse<Schema$LiveBroadcastListResponse>(
          { items: broadcasts },
          200
        )
      )
  })
  it("should fetch broadcast", async () => {
    await broadcastHandler.fetchBroadcast()
    expect(broadcastListSpy).toHaveBeenCalledTimes(1)
    expect(broadcastListSpy).toHaveBeenCalledWith(broadcastListParams)
  })
  it("should return the first broadcast from request", async () => {
    const { success, value } = await broadcastHandler.fetchBroadcast()
    expect(success).toBe(true)
    expect(value).toBeDefined()
    expect(value).toHaveProperty("snippet")
    expect(value.snippet).toHaveProperty("liveChatId")
    expect(value.snippet.liveChatId).toEqual(sampleChatId)
  })
  it("should fail on no broadcasts found", async () => {
    broadcastListSpy = jest
      .spyOn(ytClient.liveBroadcasts, "list")
      .mockImplementation(() =>
        gaxiosResponse<Schema$LiveBroadcastListResponse>({ items: [] }, 200)
      )
    const { success, value } = await broadcastHandler.fetchBroadcast()
    expect(success).toBe(false)
    expect(value).toBeUndefined()
    expect(logger.error).toHaveBeenCalledTimes(0)
  })
  it("should handle on failed request", async () => {
    broadcastListSpy = jest
      .spyOn(ytClient.liveBroadcasts, "list")
      .mockImplementation(() => {
        throw new Error()
      })
    const { success, value } = await broadcastHandler.fetchBroadcast()
    expect(success).toBe(false)
    expect(value).toBeUndefined()
    expect(logger.error).toHaveBeenCalledTimes(1)
  })
})
describe("fetch messages", () => {
  let fetchMessageParams
  const nextPageToken = "next_page"
  let fetchMessageSpy: jest.SpyInstance
  const messages = listOf(5, (i) => chatMessage(sampleText + `_${i}`))
  beforeEach(() => {
    fetchMessageParams = {
      auth: auth,
      part: ["snippet", "authorDetails"],
      liveChatId: undefined,
      pageToken: undefined,
    }
    fetchMessageSpy = jest
      .spyOn(ytClient.liveChatMessages, "list")
      .mockImplementation(() =>
        gaxiosResponse<Schema$LiveBroadcastListResponse>(
          { items: messages, nextPageToken },
          200
        )
      )
  })
  it("should fetch messages", async () => {
    await broadcastHandler.fetchChatMessages()
    expect(fetchMessageSpy).toHaveBeenCalledTimes(1)
    expect(fetchMessageSpy).toHaveBeenCalledWith(fetchMessageParams)
  })
  it("should return messages", async () => {
    const { success, value } = await broadcastHandler.fetchChatMessages()
    expect(success).toBe(true)
    expect(value).toBeDefined()
    expect(value.length).toBe(messages.length)
    for (let i = 0; i < messages.length; i++) {
      expect(value[i]).toBe(messages[i])
    }
  })
  it("should succeed on no messages", async () => {
    fetchMessageSpy = jest
      .spyOn(ytClient.liveChatMessages, "list")
      .mockImplementation(() =>
        gaxiosResponse({ items: [], nextPageToken }, 200)
      )
    const { success, value } = await broadcastHandler.fetchChatMessages()
    expect(success).toBe(true)
    expect(value).toEqual([])
  })
  it("should handle failed request", async () => {
    fetchMessageSpy = jest
      .spyOn(ytClient.liveChatMessages, "list")
      .mockImplementation(() => {
        throw new Error()
      })
    const { success, value } = await broadcastHandler.fetchChatMessages()
    expect(success).toBe(false)
    expect(value).toBeUndefined()
    expect(logger.error).toHaveBeenCalledTimes(1)
  })
})
