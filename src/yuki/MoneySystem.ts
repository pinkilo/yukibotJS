import { file } from "../util"
import logger from "winston"

const bankFile = "./.private/bank.json"
const startingWallet = 1000
const name = "rupees"
let bank: Map<string, number>

const loadBank = async () => {
  logger.info("checking for saved bank")
  if (file.exists(bankFile)) {
    logger.info("loading saved bank")
    bank = JSON.parse(await file.read(bankFile) + "")
  }
  logger.info("making new bank")
  bank = new Map()
}

const saveBank = () => {
  logger.info("saving bank")
  return file.write(bankFile, JSON.stringify(bank))
}

const getWallet = (uid: string) => {
  if (!bank[uid]) bank[uid] = startingWallet
  return bank[uid]
}

/** Modify all given wallets by uid. Use negative numbers to remove money */
const transactionBatch = async (map: [string, number][]) => {
  map.forEach(([uid, amount]) => bank[uid] = getWallet(uid) + amount)
  await saveBank()
}

export default { name, loadBank, getWallet, transactionBatch }
