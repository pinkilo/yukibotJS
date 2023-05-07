import yukibot from "yukibot"
import process from "process"
import dotenv from "dotenv"

dotenv.config()

const { yuki } = yukibot

async function main() {
  const bot = await yuki((y) => {
    y.logLevel = "http" // info, debug, error
    y.yukiConfig.name = "MyBot"
    y.yukiConfig.prefix = /^>$/
    y.googleConfig = {
      clientId: process.env.G_CLIENT_ID,
      clientSecret: process.env.G_CLIENT_SECRET,
      redirectUri: process.env.G_REDIRECT_URI,
    }
    y.tokenLoader = async () => ({
      /*...*/
    })
    y.command((cmd) => {
      cmd.name = "greet"
      cmd.invoke = async () => {
        await y.sendMessage("Hello There")
      }
    })
  })

  bot.express.listen(3000, () => console.log(`http://localhost:${3000}`))
  bot.onAuthUpdate(() => bot.start())
}

main()
