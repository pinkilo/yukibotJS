import { promisify } from "util"
import fs from "fs"

export default {
  write: promisify(fs.writeFile),
  read: promisify(fs.readFile),
  exists: fs.existsSync,
}
