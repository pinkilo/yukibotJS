import { youtube_v3 } from "googleapis"
import { runCmd } from "./commands"
import logger from "winston"
import ChatMessage = youtube_v3.Schema$LiveChatMessage
import { passives } from "./passives"

export type TokenBin = {
  isCommand: boolean
  command: string
  params: string[]
  msg: string
}

export const tokenize = (msg: string): TokenBin => {
  const tokens = msg.split(/\s+/)
  const isCommand = tokens[0].match(/^[>!].*$/) !== null
  const command = isCommand ? tokens[0].substring(1).toLowerCase() : null
  const params = isCommand ? tokens.slice(1) : null
  return { isCommand, command, params, msg }
}

export const processMessage = async (msg: ChatMessage) => {
  logger.debug("tokenizing")
  const tokens = tokenize(msg.snippet.displayMessage)
  logger.debug("", { tokens })
  if (tokens.isCommand) await runCmd(tokens.command, msg, tokens)
  // run passives
  const predicates = await Promise.all(
    passives.map((p) => p.predicate(msg, tokens, p))
  )
  logger.info(`running ${predicates.length} passives`)
  await Promise.all(
    passives
      .filter((_, i) => predicates[i])
      .map((p) => p.invoke(msg, tokens, p))
  )
}
