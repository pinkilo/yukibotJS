import { youtube_v3 } from "googleapis"
import { getCmd } from "./commands"
import ChatMessage = youtube_v3.Schema$LiveChatMessage

export type TokenBin = {
  isCommand: boolean
  command: string
  params: string[]
  msg: string
}

export const tokenize = (msg: string): TokenBin => {
  const tokens = msg.split(/\s+/)
  const isCommand = tokens[0].match(/^>.*$/) !== null
  const command = isCommand ? tokens[0].substring(1) : null
  const params = isCommand ? tokens.slice(1) : null
  return { isCommand, command, params, msg }
}

export const processMessage = (msg: ChatMessage): void => {
  const tokens = tokenize(msg.snippet.displayMessage)
  if (tokens.isCommand) {
    const cmd = getCmd(tokens.command)?.invoke
    if (!cmd) return null
    console.log(`RUNNING: ${ tokens.command }`)
    cmd(msg, tokens)
  }
  // TODO process passives
}
