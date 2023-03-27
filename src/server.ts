import express from "express"
import { join } from "path"
import yt from "./YoutubeApi"

export default () => {
  const svr = express()

  svr.get("/", async (_, res) => {
    res.sendFile(join(__dirname, "assets/index.html"))
  })

  svr.get("/auth", (_, res) => {
    res.redirect(yt.getAuthUrl())
  })

  svr.get("/callback", async (req, res) => {
    const { code } = req.query
    const creds = await yt.getTokens(code as string)
    yt.authorize(creds)
    res.redirect("/")
  })

  return svr
}

