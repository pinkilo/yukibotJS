import { AsyncCache, failure, successOf, SyncCache } from "../internal"
import { createLogger } from "winston"

describe("Caches", () => {
  describe("Sync Cache", () => {
    let cache: SyncCache<number>
    let fetchMock: jest.Mock
    it("should fetch values", () => {
      fetchMock = jest.fn().mockImplementation((key) => parseInt(key))
      cache = new SyncCache(fetchMock)
      expect(cache.get("10")).toBe(10)
    })
  })
  describe("Async Cache", () => {
    let cache: AsyncCache<number>
    let fetchMock: jest.Mock

    it("should fetch values", async () => {
      fetchMock = jest
        .fn()
        .mockImplementation(async (key) => successOf(parseInt(key)))
      cache = new AsyncCache<number>(fetchMock, createLogger())
      expect(await cache.get("10")).toBe(10)
    })

    it("should not add on failed fetches", async () => {
      fetchMock = jest.fn().mockImplementation(async () => failure())
      cache = new AsyncCache<number>(fetchMock, createLogger())
      expect(await cache.get("10")).toBe(undefined)
    })
  })
})
