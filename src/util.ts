import { promisify } from "util"
import fs from "fs"

export const file = {
  write: promisify(fs.writeFile),
  read: promisify(fs.readFile),
  exists: fs.existsSync,
}

export const randFromRange = (
  iMin: number,
  eMax: number,
  round: boolean = true
): number => {
  let val = iMin + Math.random() * eMax
  if (round) val = Math.round(val)
  return val
}
