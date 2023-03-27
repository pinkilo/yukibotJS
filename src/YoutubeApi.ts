import ENV from "./env"
import { google } from "googleapis"
import { Credentials } from "google-auth-library"
import { file } from "./util"
import * as console from "console"

const yt = google.youtube("v3")
let liveChatId: string
let nextPage: string
let pollingInterval: NodeJS.Timer
const ratelimit = 5000
const chatMessages = []
const tokenPath = "./.private/tokens.json"
const onAuthUpdate: Array<((Credentials) => any)> = []

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
      onAuthUpdate.forEach(f => f(tokens))
    } else {
      console.log("No saved tokens")
    }
  } else {
    console.log("No saved tokens")
  }
}

const getChatMessages = async () => {
  const response = await yt.liveChatMessages.list({
    auth,
    part: ["snippet", "authorDetails"],
    liveChatId,
    pageToken: nextPage,
  })
  const newMessages = response.data.items
  chatMessages.push(...newMessages)
  nextPage = response.data.nextPageToken
  console.log(chatMessages)
}

const findChat = async () => {
  const response = await yt.liveBroadcasts.list({
    auth,
    part: ["snippet"],
    broadcastStatus: "active",
  })
  const latest = response.data.items[0]
  liveChatId = latest.snippet.liveChatId
  console.log(liveChatId)
}

const trackChat = async () => {
  console.log("Attempting to track chat")
  await findChat()
  pollingInterval = setInterval(getChatMessages, ratelimit)
}

const untrackChat = () => {
  clearInterval(pollingInterval)
}

const onTokenUpdate = (callback: (Credentials) => any) => onAuthUpdate.push(callback)

auth.on("tokens", (tokens) => {
  console.log("Tokens Updated")
  onAuthUpdate.forEach(f => f(tokens))
  file.write("./.private/tokens.json", JSON.stringify(tokens))
})

export default {
  getAuthUrl,
  getTokens,
  findChat,
  trackChat,
  loadTokens,
  authorize,
  untrackChat,
  onTokenUpdate,
}
