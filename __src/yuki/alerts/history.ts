import { file } from "../../util"
import Env from "../../env"
import { Alert } from "../alerts"
import logger from "winston"

let _alertHistory: Alert[] = null

/**
 * @returns {Alert[]} Alert history. On first use it will attempt to load from file.
 */
const getAlertHistory = async (): Promise<Alert[]> => {
  if (_alertHistory === null) {
    _alertHistory = file.exists(Env.FILE.ALERTS)
      ? JSON.parse((await file.read(Env.FILE.ALERTS)) + "")
      : []
  }
  return _alertHistory
}

/**
 * @returns {boolean} true if successfully recorded to file
 */
const recordAlert = async (alert: Alert): Promise<boolean> => {
  const history = await getAlertHistory()
  history.push(alert)
  try {
    await file.write(Env.FILE.ALERTS, JSON.stringify(history))
  } catch (err) {
    logger.error("failed to write alert history to file", { err })
    return false
  }
  return true
}

export { getAlertHistory, recordAlert }
