import { file } from "../util"
import logger from "winston"

const bankFile = "./.private/bank.json"
const startingWallet = 100
const name = "rupee"
let bank: Record<string, number>

const loadBank = async () => {
  logger.info("checking for saved bank")
  bank = {}
  if (file.exists(bankFile)) {
    logger.info("loading saved bank")
    const raw = JSON.parse(await file.read(bankFile) + "") as Record<string, number>
    Object.entries(raw).forEach(e => bank[e[0]] = e[1])
    logger.debug("loaded saved bank", { bank })
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
  return file.write(bankFile, JSON.stringify(bank))
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

const getLeaderboard = (): Array<[string, number]> => Array.from(Object.entries(bank))
  .sort(([_, a], [__, b]) => b - a)

export default { name, loadBank, getWallet, transactionBatch, getBank, getLeaderboard }
