import { file } from "../util"
import Env from "../env"
import { AlertEvent, announce, EventName, listen } from "../event"

export type Alert = {
  description: string
  image?: string
  durationSec: number
  redeemer: { name: string; id: string }
}

export const alertHistory: Alert[] = []
export const loadAlertHistory = async () => {
  if (!file.exists(Env.FILE.ALERTS)) return
  const raw = await file.read(Env.FILE.ALERTS)
  const list = JSON.parse(raw + "")
  alertHistory.push(...list)
}

listen<AlertEvent>(
  EventName.ALERT, () => file.write(Env.FILE.ALERTS, JSON.stringify(alertHistory))
)

let alertQueue: Alert[] = []

export const addAlert = (alert: Alert) => {
  alertQueue.push(alert)
  alertHistory.push(alert)
  announce({ name: EventName.ALERT, alert })
}

export const dumpAlerts = () => {
  const tmp = alertQueue.map((a) => a)
  alertQueue = []
  return tmp
}

export const nextAlert = () => alertQueue.shift()
