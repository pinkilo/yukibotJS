import ENV from "./env"
import { google } from "googleapis"
import { Response } from "express"

const yt = google.youtube("v3")

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

const ytService = {
  getCode: (res: Response) => {
    res.redirect(auth.generateAuthUrl({ access_type: "offline", scope }))
  },
  getTokensWithCode: (code: String) => {
    // TODO
  },
}

export default ytService
