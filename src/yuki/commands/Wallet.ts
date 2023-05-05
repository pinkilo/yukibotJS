import Command from "./Command"
import yt from "../../youtube"
import MS from "../MoneySystem"
import logger from "winston"
import { enqueueNewAlert } from "../alerts"

export const Wallet = new Command(
  "wallet",
  ["bank"],
  0,
  120,
  0,
  async ({ authorDetails }, tokens) => {
    let msg: string
    switch (tokens.params[0]) {
      case undefined:
      default:
        const wallet = MS.walletCache.get(authorDetails.channelId)
        msg = `${authorDetails.displayName} has ${wallet} ${MS.name}s`
        break
    }
    const failed = await yt.chat.sendMessage(msg)
    if (failed) logger.error("failed to send message")
  }
)

/**
 * If RANK send ranking
 * else if WEALTHGAP send number of people below you in rank
 */
export const Ranking = new Command(
  "rank",
  ["wealthgap"],
  0,
  120,
  0,
  async ({ authorDetails: { channelId, displayName } }, { command }) => {
    const wallet = MS.walletCache.get(channelId)
    const lb = await MS.getLeaderboard()
    const rank = lb.findIndex(([uid]) => uid === channelId)
    let msg =
      command == "rank"
        ? `#${rank + 1}: ${displayName} | ${wallet} ${MS.name}`
        : `${lb.length - rank - 1} citizen(s) are poorer than ${displayName}`
    const failed = await yt.chat.sendMessage(msg)
    if (failed) logger.error("failed to send message")
  }
)

let leaderboardDisplayDuration: number = 0

export const popLeaderboardDisplayTimer = (): number | null => {
  const out = leaderboardDisplayDuration
  leaderboardDisplayDuration = 0
  return out
}

/** @command leaderboard [me] set leaderboardDisplay to true for N seconds */
export const Leaderboard = new Command(
  "leaderboard",
  ["forbes"],
  10,
  0,
  60 * 3,
  async ({ authorDetails: { channelId, displayName } }) => {
    leaderboardDisplayDuration = 30
    await enqueueNewAlert("Leaderboard Display", displayName, channelId)
  }
)
