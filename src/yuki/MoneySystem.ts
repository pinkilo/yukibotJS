import { file } from "../util"
import logger from "winston"
import ENV from "../env"
import { userCache } from "../Cache"

const startingWallet = 100
const name = "rupee"
let bank: Record<string, number>

const loadBank = async () => {
  logger.info("checking for saved bank")
  bank = {}
  if (file.exists(ENV.FILE.CACHE.BANK)) {
    logger.info("loading saved bank")
    const raw = JSON.parse(await file.read(ENV.FILE.CACHE.BANK) + "") as Record<string, number>
    Object.entries(raw).forEach(e => bank[e[0]] = e[1])
    logger.debug("loaded saved bank")
    return
  }
  logger.info("making new bank")
}

const getBank = async () => {
  if (!bank) await loadBank()
  return bank
}

const saveBank = () => {
  logger.info("saving bank")
  return file.write(ENV.FILE.CACHE.BANK, JSON.stringify(bank))
}

const getWallet = (uid: string): number => {
  if (!bank[uid]) bank[uid] = startingWallet
  return bank[uid]
}

/** Modify all given wallets by uid. Use negative numbers to remove money */
const transactionBatch = async (batch: [string, number][]) => {
  batch.forEach(([uid, amount]) => bank[uid] = getWallet(uid) + amount)
  await saveBank()
}

/** @returns sorted list of wallets (larges -> smallest) */
const getLeaderboard = async (hydrate: boolean = false): Promise<[string, number][]> => {
  const lb = Array.from(Object.entries(bank)).sort(([_, a], [__, b]) => b - a)
  if (hydrate) {
    const users = (await Promise.all(lb.map(([uid]) => userCache.get(uid))))
      .filter(u => u)
    return lb.map(([lbId, val]) => {
      return [users.find(u => u.id === lbId)?.name || "unknown", val]
    })
  }
  return lb
}

export default { name, loadBank, getWallet, transactionBatch, getBank, getLeaderboard }
