import { promisify } from "util"
import fs from "fs"

export const file = {
  write: promisify(fs.writeFile),
  read: promisify(fs.readFile),
}
