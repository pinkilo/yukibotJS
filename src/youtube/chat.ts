import { google } from "googleapis"
import { ChatMessage, User } from "../types/google"
import { auth } from "./auth"
import logger from "winston"
import yt from "./index"

const ytApi = google.youtube("v3")
let liveChatId: string
let nextPage: string
const chatMessages = []

const chatListeners: Array<((incoming: ChatMessage[], all: ChatMessage[]) => any)> = []
const chatters = new Map<string, User>()

const getBroadcast = async () => {
  const response = await ytApi.liveBroadcasts.list({
    auth,
    part: ["snippet"],
    broadcastStatus: "active",
  })
  return response.data.items[0]
}

const onChatUpdate = (cb: (i: ChatMessage[], a: ChatMessage[]) => any) => {
  chatListeners.push(cb)
}

const getChatMessages = async () => {
  const response = await ytApi.liveChatMessages.list({
    auth,
    part: ["snippet", "authorDetails"],
    liveChatId,
    pageToken: nextPage,
  })
  const newMessages = response.data.items
  chatMessages.push(...newMessages)
  nextPage = response.data.nextPageToken
  newMessages.map(m => m.authorDetails)
    .forEach(user => {
      chatters.set(user.channelId, user)
      chatters.set(user.displayName, user)
    })
  chatListeners.forEach(cb => cb(newMessages, chatMessages))
  setTimeout(getChatMessages, 5000) //response.data.pollingIntervalMillis
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

export {
  ytApi as api,
  findChat,
  trackChat,
  onChatUpdate,
  sendMessage,
  getChatters,
  getChatter,
  getRandomChatter,
}
