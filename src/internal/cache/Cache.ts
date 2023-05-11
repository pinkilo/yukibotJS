export default abstract class Cache<V> {
  protected readonly map: Record<string, V>

  protected constructor(map: Record<string, V> = {}) {
    this.map = map
  }

  put(key: string, value: V) {
    this.map[key] = value
  }

  get keys(): string[] {
    return Object.keys(this.map)
  }

  get values(): V[] {
    return Object.values(this.map)
  }

  get entries(): [string, V][] {
    return Object.entries(this.map)
  }
}
