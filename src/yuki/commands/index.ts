import Command from "./Command"
import ListCommands from "./ListCommands"
import BeatAss from "./BeatAss"
import { TokenBin } from "../processing"
import console from "console"
import { ChatMessage } from "../../types/google"

const commandMap = new Map<string, Command>()

commandMap[ListCommands.name] = ListCommands
commandMap[BeatAss.name] = BeatAss

const getCmd = (name: string): Command | undefined => commandMap[name]

const runCmd = async (name: string, msg: ChatMessage, tokens: TokenBin) => {
  const cmd = getCmd(name)
  if (cmd) {
    console.log(`RUNNING: ${ name }`)
    await cmd?.execute(msg, tokens)
  }
}

export { Command, runCmd, getCmd }
