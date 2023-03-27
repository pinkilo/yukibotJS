import ENV from "./env"
import { google, youtube_v3 } from "googleapis"
import { Credentials } from "google-auth-library"
import { file } from "./util"
import * as console from "console"
import ChatMessage = youtube_v3.Schema$LiveChatMessage

// TODO Track chat participants

const ytApi = google.youtube("v3")
let liveChatId: string
let nextPage: string
const chatMessages = []
const tokenPath = "./.private/tokens.json"
const tokenListeners: Array<((c: Credentials) => any)> = []
const chatListeners: Array<((incoming: ChatMessage[], all: ChatMessage[]) => any)> = []

const scope = [
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/youtube",
  "https://www.googleapis.com/auth/youtube.force-ssl",
]

const auth = new google.auth.OAuth2(
  ENV.GOOGLE.G_CLIENT_ID,
  ENV.GOOGLE.G_CLIENT_SECRET,
  ENV.GOOGLE.G_REDIRECT_URI,
)

const onTokenUpdate = (callback: (Credentials) => any) => tokenListeners.push(callback)

auth.on("tokens", (tokens) => {
  console.log("Tokens Updated")
  tokenListeners.forEach(f => f(tokens))
  file.write("./.private/tokens.json", JSON.stringify(tokens))
})

const getAuthUrl = () => {
  return auth.generateAuthUrl({ access_type: "offline", scope })
}

/** Sets auth credentials and writes tokens to file */
const authorize = (tokens: Credentials) => auth.setCredentials(tokens)

/** Get auth tokens with callback code */
const getTokens = async (code: string): Promise<Credentials> => {
  const creds = await auth.getToken(code)
  return creds.tokens
}

const loadTokens = async () => {
  if (file.exists(tokenPath)) {
    const raw = await file.read(tokenPath)
    const tokens = JSON.parse(raw.toString())
    if (tokens) {
      console.log("loading saved tokens")
      auth.setCredentials(tokens)
      tokenListeners.forEach(f => f(tokens))
    } else {
      console.log("No saved tokens")
    }
  } else {
    console.log("No saved tokens")
  }
}

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
  chatListeners.forEach(cb => cb(newMessages, chatMessages))
  setTimeout(getChatMessages, response.data.pollingIntervalMillis)
}

const findChat = async () => {
  liveChatId = (await getBroadcast()).snippet.liveChatId
  console.log(liveChatId)
}

const trackChat = async () => {
  console.log("Attempting to track chat")
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
  console.log(response)
  return response.status == 201
}

export default {
  getAuthUrl,
  getTokens,
  findChat,
  trackChat,
  loadTokens,
  authorize,
  onTokenUpdate,
  onChatUpdate,
  sendMessage,
  api: ytApi,
}
