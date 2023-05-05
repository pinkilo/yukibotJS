import { nanoid } from "nanoid"

export default class Alert {
  readonly id: string = nanoid()
  readonly description: string
  /** duration of the alert display in seconds */
  readonly durationSec: number
  /** data of relevant user */
  readonly redeemer: { name: string; id: string }
  /** path to audio file in public directory */
  readonly sound?: string

  /**
   * @param description
   * @param redeemer data of relevant user
   * @param sound path to audio file in public directory
   * @param durationSec duration of the alert display in seconds
   */
  constructor(
    description: string,
    redeemer: { name: string; id: string },
    durationSec: number,
    sound?: string
  ) {
    this.description = description
    this.durationSec = durationSec
    this.redeemer = redeemer
    this.sound = sound
  }
}
