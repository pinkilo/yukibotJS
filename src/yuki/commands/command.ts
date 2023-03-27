import ChatMessage = youtube_v3.Schema$LiveChatMessage
import { youtube_v3 } from "googleapis"
import { TokenBin } from "../processing"

const commandMap = new Map<string, Command>()

export type Command = {
  name: string
  invoke: (msg: ChatMessage, tokens: TokenBin) => void
}

export const getCmd = (name: string): Command | undefined => commandMap.get(name)

export const runCmd = (name: string, msg: ChatMessage, tokens: TokenBin) => {
  const cmd = getCmd(name)
  if (cmd) {
    console.log(`RUNNING: ${ name }`)
    cmd?.invoke(msg, tokens)
  }
}
