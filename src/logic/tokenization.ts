type TokenBin = {
  isCommand: boolean
  command: string | null
  params: string[] | null
  msg: string
}

const tokenize = (msg: string, prefix: RegExp): TokenBin => {
  const tokens = msg.split(/\s+/)
  const match = tokens[0].match(prefix)
  const isCommand = match !== null
  const command = isCommand ? tokens[0].substring(match[0].length) : null
  const params = isCommand ? tokens.slice(1) : null
  return { isCommand, command, params, msg }
}

export { TokenBin, tokenize }
