import { file } from "./util"
import logger from "winston"

abstract class Cache<V> {
  protected readonly map: Record<string, V>

  protected constructor(map: Record<string, V> = {}) {
    this.map = map
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

export class SyncCache<V> extends Cache<V> {
  private readonly fetch: (key: string) => V

  constructor(fetch: (key: string) => V, map: Record<string, V> = {}) {
    super(map)
    this.fetch = fetch
  }

  get(key: string): V {
    if (!this.map[key]) this.map[key] = this.fetch(key)
    return this.map[key]
  }
}

export class AsyncCache<V> extends Cache<V> {
  private readonly fetch: (key: string) => Promise<V>

  constructor(fetch: (key: string) => Promise<V>, map: Record<string, V> = {}) {
    super(map)
    this.fetch = fetch
  }

  async get(key: string): Promise<V> {
    if (!this.map[key]) {
      this.map[key] = await this.fetch(key)
      if (!this.map[key])
        logger.debug(`failed to fetch map value for key: "${key}"`)
    }
    return this.map[key]
  }
}
