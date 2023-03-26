import yt from "./youtubeService"
import { join } from "path"
import express from "express"

const server = express()

server.get("/", (_, res) => {
  res.sendFile(join(__dirname, "assets/index.html"))
})

server.get("/auth", (_, res) => {
  yt.getCode(res)
})

server.get("/callback", (req, res) => {
  const { code } = req.query
  yt.getTokensWithCode(code as string)
  res.redirect("/")
})

server.listen(3000, () => console.log("http://localhost:3000"))
