import { youtube_v3 } from "googleapis"
import { TokenBin } from "../processing"
import ChatMessage = youtube_v3.Schema$LiveChatMessage
import BeatAss from "./beatass"
import * as console from "console"

const commandMap = new Map<string, Command>()

export type Command = {
  name: string,
  alias?: string[]
  invoke: (msg: ChatMessage, tokens: TokenBin) => Promise<void>
}

const CommandsCommand: Command = {
  name: "commands",
  alias: ["cmds"],
  invoke: async () => {
    // TODO Commands Command
  },
}

commandMap[CommandsCommand.name] = CommandsCommand
commandMap[BeatAss.name] = BeatAss

export const getCmd = (name: string): Command | undefined => commandMap[name]

export const runCmd = async (name: string, msg: ChatMessage, tokens: TokenBin) => {
  const cmd = getCmd(name)
  if (cmd) {
    console.log(`RUNNING: ${ name }`)
    await cmd?.invoke(msg, tokens)
  }
}
