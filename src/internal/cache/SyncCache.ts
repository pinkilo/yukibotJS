import Cache from "./Cache"

export default class SyncCache<V> extends Cache<V> {
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
