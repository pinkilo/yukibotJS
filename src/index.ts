import yt from "./YoutubeApi"
import server from "./server"
import { processMessage } from "./yuki"

async function main() {
  yt.onTokenUpdate(() => yt.trackChat())
  yt.onChatUpdate((incoming, all) => {
    console.log(`all ${ all.length }`, incoming.length > 0 ? incoming : "")
  })
  yt.onChatUpdate((incoming) => incoming.forEach(processMessage))

  await yt.loadTokens()

  server().listen(3000, () => console.log("http://localhost:3000"))
}

main()
