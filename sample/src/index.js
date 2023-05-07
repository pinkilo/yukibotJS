import {yuki} from "yukibot"

async function main() {
  const bot = await yuki(bldr => {
    bldr.logLevel = "info"
    bldr.yukiConfig.name = "MyBot"
    bldr.yukiConfig.prefix = /^>$/
    bldr.tokenLoader = async () => ({/*...*/})
    bldr.command(cmd => {
      cmd.name = "greet"
      cmd.invoke = async () => {
        await bldr.sendMessage("Hello There")
      }
    })
  })

  await bot.start()
}

main()
