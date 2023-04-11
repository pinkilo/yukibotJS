// TODO persistent alert history

export type Alert = {
  message: string
  image?: string
  durationSec: number,
  redeemer: { name: string, id: string }
}

let alertQueue: Alert[] = []

export const addAlert = (alert: Alert) => alertQueue.push(alert)

export const dumpAlerts = () => {
  const tmp = alertQueue.map(a => a)
  alertQueue = []
  return tmp
}

export const nextAlert = () => alertQueue.shift()
