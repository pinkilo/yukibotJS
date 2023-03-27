import ChatMessage = youtube_v3.Schema$LiveChatMessage
import { youtube_v3 } from "googleapis"
import { TokenBin } from "../processing"

const commandMap = new Map<string, Command>()

export type Command = {
  name: string
  invoke: (msg: ChatMessage, tokens: TokenBin) => void
}

export const getCmd = (name: string): Command | undefined => commandMap.get(name)
