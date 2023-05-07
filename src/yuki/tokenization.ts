type TokenBin = {
  isCommand: boolean
  command: string
  params: string[]
  msg: string
}

const tokenize = (msg: string, prefix?: RegExp): TokenBin => {
  const tokens = msg.split(/\s+/)
  const isCommand = prefix && tokens[0].match(prefix) !== null
  const command = isCommand ? tokens[0].substring(1).toLowerCase() : null
  const params = isCommand ? tokens.slice(1) : null
  return { isCommand, command, params, msg }
}

export { TokenBin, tokenize }
