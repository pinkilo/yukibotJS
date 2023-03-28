import express from "express"
import { join } from "path"
import yt from "./YoutubeApi"
import * as console from "console"

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
    console.debug("callback", code)
    const creds = await yt.getTokens(code as string)
    console.debug(creds)
    yt.authorize(creds)
    res.redirect("/")
  })

  return svr
}

