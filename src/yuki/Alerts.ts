import { file, randFromRange } from "../util"
import Env from "../env"
import { AlertEvent, announce, EventName, listen } from "../event"
import { join } from "path"

export type Alert = {
  description: string
  durationSec: number
  redeemer: { name: string; id: string }
  sound?: string
}

/////
const randomSound = async () => {
  const sounds = await file.list(
    join(__dirname, "public/assets/audio/backstroke")
  )
  return (
    sounds?.length &&
    join("assets/audio/backstroke", sounds[randFromRange(0, sounds.length)])
  )
}

/////
listen<AlertEvent>(EventName.ALERT, async () =>
  file.write(Env.FILE.ALERTS, JSON.stringify(await getAlertHistory()))
)

let alertHistory: Alert[] = null

export const getAlertHistory = async (): Promise<Alert[]> => {
  const load = async (): Promise<Alert[]> =>
    file.exists(Env.FILE.ALERTS)
      ? JSON.parse((await file.read(Env.FILE.ALERTS)) + "")
      : []
  const set = (alerts: Alert[]) => {
    alertHistory = alerts
    return alerts
  }
  return alertHistory !== null ? alertHistory : set(await load())
}

/////
let alertQueue: Alert[] = []

export const replayAlert = (alert: Alert) => alertQueue.push(alert)

export const addAlert = async (alert: Alert) => {
  alert.sound = await randomSound()
  alertQueue.push(alert)
  ;(await getAlertHistory()).push(alert)
  announce(new AlertEvent(alert))
}

export const nextAlert = () => alertQueue.shift()
