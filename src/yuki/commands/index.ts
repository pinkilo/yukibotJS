import Command from "./Command"
import ListCommands from "./ListCommands"
import BeatAss from "./BeatAss"
import { TokenBin } from "../processing"
import { ChatMessage } from "../../types/google"
import logger from "winston"

const commandMap = new Map<string, Command>()

commandMap[ListCommands.name] = ListCommands
commandMap[BeatAss.name] = BeatAss

const getCmd = (name: string): Command | undefined => commandMap[name]

const runCmd = async (name: string, msg: ChatMessage, tokens: TokenBin) => {
  const cmd = getCmd(name)
  if (cmd) {
    logger.info(`RUNNING: ${ name }`)
    await cmd?.execute(msg, tokens)
  }
}

export { Command, runCmd, getCmd }
