import { Logger } from "winston"
import Cache from "./Cache"
import { Result } from "../util"

export default class AsyncCache<V> extends Cache<V> {
  private readonly fetch: (key: string) => Promise<Result<V>>
  private readonly logger: Logger

  constructor(
    fetch: (key: string) => Promise<Result<V>>,
    logger: Logger,
    map: Record<string, V> = {}
  ) {
    super(map)
    this.fetch = fetch
    this.logger = logger
  }

  async get(key: string): Promise<V> {
    if (!this.map[key]) {
      const { success, value } = await this.fetch(key)
      if (success) this.map[key] = value
      else this.logger.debug(`failed to fetch map value for key: "${key}"`)
    }
    return this.map[key]
  }
}
