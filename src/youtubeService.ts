import ENV from "./env"
import { google } from "googleapis"
import { Response } from "express"
import { Credentials } from "google-auth-library"
import { file } from "./util"

//const yt = google.youtube("v3")

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
  console.log("generating auth url")
  const authUrl = auth.generateAuthUrl({ access_type: "offline", scope })
  console.log(authUrl, "redirecting")
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

export default {
  getCode,
  getTokensWithCode,
}
