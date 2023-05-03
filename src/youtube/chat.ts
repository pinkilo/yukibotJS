import logger from "winston"
import auth from "./auth"
import ytApi, { basePollingRate } from "./apiClient"
import { announce, MessageBatchEvent } from "../event"
import { userCache } from "../Cache"
import { User } from "../models"
import { randFromRange } from "../util"
import Env from "../env"

const chatMessages = []
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
    .map((m) => User.fromAuthor(m.authorDetails))
    .forEach((user) => {
      userCache.put(user.id, user)
      userCache.put(user.name, user)
    })
  announce(new MessageBatchEvent(newMessages, chatMessages))
  chatMessages.push(...newMessages)
  setTimeout(getChatMessages, basePollingRate)
}

const findChat = async () => {
  liveChatId = (await getBroadcast()).snippet.liveChatId
  logger.info(`Chat ID: ${liveChatId}`)
}

const trackChat = async () => {
  logger.info("attempting to track chat")
  await findChat()
  await getChatMessages()
}

const sendMessage = async (text: string) => {
  if (Env.NODE_ENV === "test") return true
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
  const users = userCache.values().filter((u) => !exclude.includes(u.id))
  return users[randFromRange(0, users.length)]
}

const fetchUsers = async (uid: string[]): Promise<User[]> => {
  const result = await ytApi.channels.list({
    id: uid,
    part: ["snippet"],
    auth,
  })
  return result.data.items?.map((c) => User.fromChannel(c)) || []
}

export {
  ytApi as api,
  findChat,
  trackChat,
  sendMessage,
  getRandomUser,
  fetchUsers,
}
