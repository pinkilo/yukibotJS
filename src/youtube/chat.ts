import { google } from "googleapis"
import { Subscription } from "../types/google"
import { auth } from "./auth"
import logger from "winston"
import { announce, EventName, MessageBatchEvent, SubscriberEvent } from "../event"
import { userCache } from "../Cache"
import { User } from "../models"
import { randFromRange } from "../util"

const ytApi = google.youtube("v3")
const chatMessages = []
const basePollingRate = 14.4 * 1000
let lastSub: Subscription
let liveChatId: string
let nextPage: string

const getBroadcast = async () => {
  const response = await ytApi.liveBroadcasts.list({
    auth,
    part: ["snippet"],
    broadcastStatus: "active",
  })
  return response.data.items[0]
}

const getChatMessages = async () => {
  const response = await ytApi.liveChatMessages.list({
    auth,
    part: ["snippet", "authorDetails"],
    liveChatId,
    pageToken: nextPage,
  })
  const newMessages = response.data.items
  nextPage = response.data.nextPageToken
  newMessages
    .map(m => User.fromAuthor(m.authorDetails))
    .forEach(user => {
      userCache.put(user.id, user)
      userCache.put(user.name, user)
    })
  announce<MessageBatchEvent>({
    name: EventName.MESSAGE_BATCH,
    incoming: newMessages,
    all: chatMessages,
  })
  chatMessages.push(...newMessages)
  setTimeout(getChatMessages, basePollingRate)
}

const findChat = async () => {
  liveChatId = (await getBroadcast()).snippet.liveChatId
  logger.info(`Chat ID: ${ liveChatId }`)
}

const trackChat = async () => {
  logger.info("attempting to track chat")
  await findChat()
  await getChatMessages()
}

const sendMessage = async (text: string) => {
  const response = await ytApi.liveChatMessages.insert({
    auth,
    part: ["snippet"],
    requestBody: {
      snippet: {
        liveChatId,
        type: "textMessageEvent",
        textMessageDetails: {
          messageText: text,
        },
      },
    },
  })
  return response.status == 201
}

const getRandomUser = (exclude: string[] = []): User => {
  const users = userCache.values().filter(u => !exclude.includes(u.id))
  return users[randFromRange(0, users.length)]
}

const fetchUsers = async (uid: string[]): Promise<User[]> => {
  const result = await ytApi.channels.list({ id: uid, part: ["snippet"], auth })
  return result.data.items.map(c => User.fromChannel(c))
}

const getRecentSubscribers = async () => {
  logger.info("checking subscribers")
  const response = await ytApi.subscriptions.list({
    auth,
    part: ["subscriberSnippet"],
    myRecentSubscribers: true,
  })
  if (lastSub.snippet.channelId != response.data.items[0].snippet.channelId) {
    announce<SubscriberEvent>({
      name: EventName.SUBSCRIBER,
      subscription: response.data.items[0],
    })
  }
  setTimeout(() => getRecentSubscribers(), basePollingRate * 2)
}

export {
  ytApi as api,
  findChat,
  trackChat,
  sendMessage,
  getRandomUser,
  fetchUsers,
}
