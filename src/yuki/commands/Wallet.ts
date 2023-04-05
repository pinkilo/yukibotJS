import Command from "./Command"
import yt from "../../youtube"
import MS from "../MoneySystem"
import logger from "winston"

/**
 * If RANK send ranking
 * else if WEALTHGAP send number of people below you in rank
 */
export const Ranking = new Command("rank", ["wealthgap"], 0, 120, 0,
  async ({ authorDetails: { channelId, displayName } }, { command }) => {
    const wallet = MS.getWallet(channelId)
    const lb = MS.getLeaderboard()
    const rank = lb.findIndex(([uid]) => uid === channelId)
    let msg = command == "rank"
      ? `#${ rank + 1 }: ${ displayName } | ${ wallet } ${ MS.name }`
      : `${ lb.length - rank } citizen(s) are poorer than ${ displayName }`
    const failed = await yt.chat.sendMessage(msg)
    if (failed) logger.error("failed to send message")
  })

// TODO IF PARAM:ME send leaderboard centered on user
export const Leaderboard = new Command("leaderboard", ["forbes"], 0, 0, 180,
  async () => {
    const lb = MS.getLeaderboard()
    if (lb.length === 0) {
      await yt.chat.sendMessage("No wallets are active :(")
      return
    }
    const sub = lb.slice(0, 5)
    // get channels (users)
    const channels = await yt.chat.getChannels(sub.map(([uid]) => uid))
    // send messages
    for (let i = 0; i < sub.length; i++) {
      await yt.chat.sendMessage(`#${ i + 1 }: ${ channels[i].title } | ${ sub[i][1] }`)
    }
  })

export const Wallet = new Command(
  "wallet", ["bank"], 0, 120, 0,
  async ({ authorDetails }, tokens) => {
    if (tokens.params.length > 0 && authorDetails.isChatModerator) {
      // TODO add modification commands
      return
    }
    let msg: string
    switch (tokens.params[0]) {
      case undefined:
      default:
        const wallet = MS.getWallet(authorDetails.channelId)
        msg = `${ authorDetails.displayName } has ${ wallet } ${ MS.name }s`
        break
    }
    const failed = await yt.chat.sendMessage(msg)
    if (failed) logger.error("failed to send message")
  })
