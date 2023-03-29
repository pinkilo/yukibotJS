import Command from "./Command"
import ListCommands from "./ListCommands"
import BeatAss from "./BeatAss"
import { TokenBin } from "../processing"
import { ChatMessage } from "../../types/google"
import logger from "winston"
import Socials from "./Socials"
import Wallet from "./Wallet"

const commandMap = new Map<string, Command>();

(() => [ListCommands, BeatAss, Socials, Wallet]
    .forEach(cmd => [cmd.name, ...cmd.alias]
      .forEach(name => commandMap[name] = cmd))
)()

const getCmd = (name: string): Command | undefined => commandMap[name]

const runCmd = async (name: string, msg: ChatMessage, tokens: TokenBin) => {
  const cmd = getCmd(name)
  if (cmd) {
    logger.info(`RUNNING: ${ name }`)
    await cmd?.execute(msg, tokens)
  } else {
    logger.debug(`no command found with name "${ name }"`)
  }
}

export { Command, runCmd, getCmd }
