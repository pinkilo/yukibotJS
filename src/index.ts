import yt from "./youtubeService"
import { join } from "path"
import express from "express"


const server = express()

server.get("/", (_, res) => {
  res.sendFile(join(__dirname, "/index.html"))
})

server.get("/auth", (req, res) => {
  yt.getCode(res)
})

server.get("/callback", (req, res) => {
  const {code} = req.query
  yt.getTokensWithCode(code)
  res.redirect("/")
})

server.listen(3000, () => console.log("https://localhost:3000"))
