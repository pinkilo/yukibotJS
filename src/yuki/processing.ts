import { youtube_v3 } from "googleapis"
import { runCmd } from "./commands"
import ChatMessage = youtube_v3.Schema$LiveChatMessage
import * as console from "console"

export type TokenBin = {
  isCommand: boolean
  command: string
  params: string[]
  msg: string
}

export const tokenize = (msg: string): TokenBin => {
  const tokens = msg.split(/\s+/)
  // TODO make matcher check against all command names
  const isCommand = tokens[0].match(/^>.*$/) !== null
  const command = isCommand ? tokens[0].substring(1).toLowerCase() : null
  const params = isCommand ? tokens.slice(1) : null
  return { isCommand, command, params, msg }
}

export const processMessage = async (msg: ChatMessage) => {
  const tokens = tokenize(msg.snippet.displayMessage)
  console.log(tokens)
  if (tokens.isCommand) {
    await runCmd(tokens.command, msg, tokens)
  }
  // TODO process passives
}
