import { google } from "googleapis"
import ENV from "../env"
import { file } from "../util"
import { Credentials } from "google-auth-library"
import logger from "winston"

const tokenPath = "./.private/tokens.json"
const tokenListeners: Array<((c: Credentials) => any)> = []

const auth = new google.auth.OAuth2(
  ENV.GOOGLE.G_CLIENT_ID,
  ENV.GOOGLE.G_CLIENT_SECRET,
  ENV.GOOGLE.G_REDIRECT_URI,
)

const onTokenUpdate = (callback: (Credentials) => any) => tokenListeners.push(callback)

/** Sets auth credentials and writes tokens to file */
const setCredentials = async (tokens: Credentials) => {
  auth.setCredentials(tokens)
  logger.info("tokens updated, running listeners")
  await Promise.all(tokenListeners.map(f => f(tokens)))
  logger.info("writing tokens to file")
  await file.write("./.private/tokens.json", JSON.stringify(tokens))
}

const getAuthUrl = () => auth.generateAuthUrl({
  access_type: "offline", scope: [
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/youtube",
    "https://www.googleapis.com/auth/youtube.force-ssl",
  ],
})

/** Get auth tokens with callback code */
const getTokens = async (code: string): Promise<Credentials> => {
  logger.info("getting tokens from callback code")
  const creds = await auth.getToken(code)
  return creds.tokens
}

const loadTokens = async () => {
  logger.info("checking for saved tokens")
  if (file.exists(tokenPath)) {
    logger.debug("attempting to parse saved tokens")
    const raw = await file.read(tokenPath)
    let tokens: Credentials
    try {
      tokens = JSON.parse(raw.toString())
    } catch (e) {
      logger.error("Failed to parse saved tokens", { e: e.message })
      return
    }
    logger.info("using saved tokens")
    await setCredentials(tokens)
    return
  }
  logger.info("No saved tokens")
}

export { auth, onTokenUpdate, getTokens, getAuthUrl, setCredentials, loadTokens }
