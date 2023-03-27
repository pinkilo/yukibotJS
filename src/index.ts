import yt from "./YoutubeApi"
import server from "./server"

async function main() {
  yt.onTokenUpdate(() => {
    yt.trackChat()
  })
  await yt.loadTokens()


  server().listen(3000, () => console.log("http://localhost:3000"))
}

main()
