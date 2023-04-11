import { file } from "./util"

export const userCache = new Cache()

export default class Cache<V> {
  private readonly map: Record<string, V>

  constructor(map: Record<string, V> = {}) {
    this.map = map
  }

  get(key: string): V {
    return this.map[key]
  }

  put(key: string, value: V) {
    this.map[key] = value
  }

  async load(path: string) {
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
