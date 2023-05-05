import logger from "winston"
import { youtube_v3 } from "googleapis"
import auth from "./auth"
import ytApi, { basePollingRate } from "./apiClient"
import { announce, MessageBatchEvent } from "../event"
import { userCache } from "./users"
import { User } from "../models"
import Env from "../env"
import Schema$LiveChatMessage = youtube_v3.Schema$LiveChatMessage
import Schema$LiveBroadcast = youtube_v3.Schema$LiveBroadcast

const chatMessages: Schema$LiveChatMessage[] = []
let liveChatId: string
let nextPage: string
let broadcast: Schema$LiveBroadcast

const getBroadcast = async () => {
  const response = await ytApi.liveBroadcasts.list({
    auth,
    part: ["snippet"],
    broadcastStatus: "active",
  })
  return response.data.items[0]
}

const getChatMessages = async () => {
  logger.info("updating chat")
  const response = await ytApi.liveChatMessages.list({
    auth,
    part: ["snippet", "authorDetails"],
    liveChatId,
    pageToken: nextPage,
  })
  const newMessages = response.data.items
  nextPage = response.data.nextPageToken
  newMessages
    .map((m) => User.fromAuthor(m.authorDetails))
    .forEach((user) => {
      userCache.put(user.id, user)
      userCache.put(user.name, user)
    })
  announce(new MessageBatchEvent(newMessages, chatMessages))
  chatMessages.push(...newMessages)
  setTimeout(getChatMessages, basePollingRate)
}

/**
 * @returns {boolean} true if successful
 */
const trackChat = async () => {
  logger.info("attempting to track chat")
  broadcast = await getBroadcast()
  if (broadcast) {
    liveChatId = broadcast.snippet.liveChatId
    logger.info(`Chat ID: ${liveChatId}`)
    logger.info("starting chat polling")
    await getChatMessages()
  } else {
    logger.error("failed to find active broadcast")
  }
  return broadcast !== undefined
}

const sendMessage = async (messageText: string) => {
  if (Env.NODE_ENV === "test") return true
  const response = await ytApi.liveChatMessages.insert({
    auth,
    part: ["snippet"],
    requestBody: {
      snippet: {
        liveChatId,
        type: "textMessageEvent",
        textMessageDetails: {
          messageText,
        },
      },
    },
  })
  return response.status == 201
}

const getChat = (index: number = 0): Schema$LiveChatMessage[] =>
  chatMessages.slice(index)

export { ytApi as api, trackChat, sendMessage, getChat }
