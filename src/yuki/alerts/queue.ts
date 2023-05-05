import { AlertEvent, announce } from "../../event"
import Alert from "./Alert"
import { file, randFromRange } from "../../util"
import { join } from "path"
import { recordAlert } from "./history"

let _alertQueue: Alert[] = []
let _sounds: string[] = null

const _randomSound = async () => {
  if (_sounds === null)
    _sounds = await file.list(join(__dirname, "public/assets/audio/backstroke"))
  return join(
    "assets/audio/backstroke",
    _sounds[randFromRange(0, _sounds.length)]
  )
}

/** Adds a new Alert to the queue, announces Alert event, records alert to history. */
const enqueueNewAlert = async (
  description: string,
  redeemerName: string,
  redeemerID: string,
  durationSec: number = 10,
  randomSound: boolean = true
) => {
  const alert = new Alert(
    description,
    { name: redeemerName, id: redeemerID },
    durationSec,
    randomSound && (await _randomSound())
  )
  _alertQueue.push(alert)
  announce(new AlertEvent(alert))
  await recordAlert(alert)
}

/** Adds the given Alert to the queue. Does not record the alert to history. */
const replayAlert = (alert: Alert) => _alertQueue.push(alert)

/** @returns the next Alert in the queue. Removes it from the queue. */
const nextAlert = () => _alertQueue.shift()

export { replayAlert, enqueueNewAlert, nextAlert }
