import Command from "./Command"
import ListCommands from "./ListCommands"
import BeatAss from "./BeatAss"
import { TokenBin } from "../processing"
import { ChatMessage } from "../../types/google"
import logger from "winston"
import Socials from "./Socials"
import { Wallet, Ranking, Leaderboard } from "./Wallet"
import { Beans } from "./Memes"
import Fox from "./Fox"
import { FitCheck, Hydrate, Pushups } from "./Redemptions"

const commandMap = new Map<string, Command>()
const enabledCommands = Object.freeze([
  ListCommands,
  BeatAss,
  Socials,
  Wallet,
  Beans,
  Ranking,
  Fox.attack,
  Fox.feed,
  Fox.dance,
  FitCheck,
  Pushups,
  Hydrate,
  Leaderboard
])

// Load commands into the map
;(() =>
  enabledCommands.forEach((cmd) =>
    [cmd.name, ...cmd.alias].forEach((name) => (commandMap[name] = cmd))
  ))()

const getCmd = (name: string): Command | undefined => commandMap[name]

const runCmd = async (name: string, msg: ChatMessage, tokens: TokenBin) => {
  const cmd = getCmd(name)
  if (cmd) {
    logger.info(`RUNNING: ${name}`)
    await cmd?.execute(msg, tokens)
  } else {
    logger.debug(`no command found with name "${name}"`)
  }
}

export { Command, runCmd, getCmd, enabledCommands }
