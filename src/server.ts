import express from "express"
import { join } from "path"
import yt from "./youtube"
import logger from "winston"
import { MoneySystem } from "./yuki"

export default () => {
  const svr = express()
  svr.use("/assets", express.static(join(__dirname, "public/assets")))

  svr.get("/", async (_, res) => res.sendFile(join(__dirname, "public/index.html")))

  svr.get("/auth", (_, res) => res.redirect(yt.auth.getAuthUrl()))

  svr.get("/callback", async (req, res) => {
    const { code } = req.query
    logger.info("auth code received")
    const tokens = await yt.auth.getTokens(code as string)
    logger.info("tokens received")
    await yt.auth.setCredentials(tokens)
    res.redirect("/")
  })

  svr.get("/fox", async (_, res) => res.sendFile(join(__dirname, "public/fox.html")))

  svr.get("/api/leaderboard", (_, res) => res.send(MoneySystem.getLeaderboard()))
    .get("api/forbes", (_, res) => res.redirect("/api/leaderboard"))

  return svr
}

