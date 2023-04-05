import { google, youtube_v3 } from "googleapis"
import { Subscription, User } from "../types/google"
import { auth } from "./auth"
import logger from "winston"
import yt from "./index"
import { announce, EventName, MessageBatchEvent, SubscriberEvent } from "../event"
import Schema$Channel = youtube_v3.Schema$Channel

const ytApi = google.youtube("v3")
let liveChatId: string
let nextPage: string
const chatMessages = []
const basePollingRate = 5000
let lastSub: Subscription

const chatters = new Map<string, User>()

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
  newMessages.map(m => m.authorDetails)
    .forEach(user => {
      chatters.set(user.channelId, user)
      chatters.set(user.displayName, user)
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

const getChatters = () => Array.from(chatters.values())
const getChatter = (uidOrName: string) => chatters.get(uidOrName)
const getRandomChatter = (exclude: string[] = []): User => {
  const chatters = yt.chat.getChatters().filter(u => !exclude.includes(u.channelId))
  return chatters[Math.floor(Math.random() * chatters.length)]
}

const getChannels = async (uid: string[]): Promise<Schema$Channel[]> => {
  const result = await ytApi.channels.list({ id: uid, part: ["snippet"], auth })
  return result.data.items
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
  getChatters,
  getChatter,
  getRandomChatter,
  getChannels,
}
