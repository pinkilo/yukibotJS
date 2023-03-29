import { file } from "../util"
import logger from "winston"

const bankFile = "./.private/bank.json"
const startingWallet = 100
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
const addMoney = async (uid: string, amount: number) => {
  bank[uid] = bank[uid] + amount
  await saveBank()
}
const removeMoney = async (uid: string, amount: number) => {
  bank[uid] = bank[uid] - amount
  await saveBank()
}

export default { name, loadBank, getWallet, addMoney, removeMoney }
