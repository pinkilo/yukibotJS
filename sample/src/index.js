import yukibot from "yukibot"

const { yuki } = yukibot

async function main() {
  const bot = await yuki((bldr) => {
    bldr.logLevel = "info"
    bldr.yukiConfig.name = "MyBot"
    bldr.yukiConfig.prefix = /^>$/
    bldr.tokenLoader = async () => ({
      /*...*/
    })
    bldr.command((cmd) => {
      cmd.name = "greet"
      cmd.invoke = async () => {
        await bldr.sendMessage("Hello There")
      }
    })
  })

  const { value: server } = await bot.start()
  server.listen(3000, () => console.log(`http://localhost:${3000}`))
}

main()
