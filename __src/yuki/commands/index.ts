import Command from "./Command"
import { TokenBin } from "../processing"
import { ChatMessage } from "../../types/google"
import logger from "winston"

const commandMap = new Map<string, Command>()
const enabledCommands: Command[] = []

// Load commands into the map
;(() =>
  enabledCommands.forEach((cmd) =>
    [cmd.name, ...cmd.alias].forEach((name) => commandMap.set(name, cmd))
  ))()

const getCmd = (name: string): Command | undefined => commandMap.get(name)

const runCmd = async (name: string, msg: ChatMessage, tokens: TokenBin) => {
  const cmd = getCmd(name)
  if (cmd) {
    logger.info(`EXECUTE: ${name}`)
    await cmd?.execute(msg, tokens)
  } else {
    logger.debug(`no command found with name "${name}"`)
  }
}

export { Command, runCmd, getCmd, enabledCommands }
