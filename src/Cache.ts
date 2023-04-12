import { file } from "./util"
import { User } from "./models"
import yt from "./youtube"
import logger from "winston"

class Cache<V> {
  private readonly map: Record<string, V>
  private readonly fetch: (key: string) => V

  constructor(
    fetch: (key: string) => V,
    map: Record<string, V> = {},
  ) {
    this.fetch = fetch
    this.map = map
  }

  async get(key: string): Promise<V> {
    if (!this.map[key]) {
      logger.debug(`Fetching cache value ${ key }`)
      this.map[key] = await this.fetch(key)
    }
    return this.map[key]
  }

  put(key: string, value: V) {
    this.map[key] = value
  }

  keys(): string[] {
    return Object.keys(this.map)
  }

  values(): V[] {
    return Object.values(this.map)
  }

  entries(): [string, V][] {
    return Object.entries(this.map)
  }

  async load(path: string) {
    if (!file.exists(path)) return
    const m = await file.read(path)
    const r = JSON.parse(m + "")
    for (let rKey in r) {
      this.put(rKey, r[rKey])
    }
  }

  async save(path: string) {
    await file.write(path, JSON.stringify(this.map))
  }
}

export const userCache = new Cache<User>((k) => yt.chat.fetchUsers([k])[0])
