export default abstract class Cache<V> {
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
}
