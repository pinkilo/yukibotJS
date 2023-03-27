import ENV from "./env"
import { google } from "googleapis"
import { Response } from "express"
import { Credentials } from "google-auth-library"
import { file } from "./util"

const yt = google.youtube("v3")
let liveChatId: string
let nextPage: string
let pollingInterval: NodeJS.Timer
const ratelimit = 5000
const chatMessages = []
const tokenPath = "./.private/tokens.json"

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

const getCode = (res: Response) => {
  const authUrl = auth.generateAuthUrl({ access_type: "offline", scope })
  res.redirect(authUrl)
}

const authorize = (tokens: Credentials) => {
  auth.setCredentials(tokens)
  console.log("credentials updated")
  file.write("./.private/tokens.json", JSON.stringify(tokens))
}

const getTokensWithCode = async (code: string) => {
  const creds = await auth.getToken(code)
  authorize(creds.tokens)
}

auth.on("tokens", (tokens) => {
  console.log("Tokens Updated")
  file.write("./.private/tokens.json", JSON.stringify(tokens))
})

const checkTokens = async () => {
  if (file.exists(tokenPath)) {
    const raw = await file.read(tokenPath)
    const tokens = JSON.parse(raw.toString())
    if (tokens) {
      console.log("loading saved tokens")
      auth.setCredentials(tokens)
    } else {
      console.log("No saved tokens")
    }
  } else {
    console.log("No saved tokens")
  }
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

const trackChat = async () => {
  await findChat()
  pollingInterval = setInterval(getChatMessages, ratelimit)
}

const untrackChat = () => {
  clearInterval(pollingInterval)
}

export default {
  getCode,
  getTokensWithCode,
  findChat,
  trackChat,
  checkTokens,
}
