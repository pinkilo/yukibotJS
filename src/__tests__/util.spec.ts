import { attempt, randFromRange } from "../internal/util"

describe("Utilities", () => {
  describe("Random Number From Range", () => {
    let randMock
    beforeEach(() => {
      randMock = jest.spyOn(global.Math, "random").mockImplementation(() => 1.1)
    })
    it("should round to integer", () => {
      expect(Number.isInteger(randFromRange(0, 2))).toEqual(true)
    })
  })

  describe("Attempt block", () => {
    it("should return successful result if no error", async () => {
      const returnValue = 10
      const result = await attempt(async () => returnValue)
      expect(result.value).toBe(returnValue)
    })
    it("should return failed result upon error", async () => {
      const result = await attempt(async () => {
        throw new Error()
      })
      expect(result.success).toBe(false)
      expect(result.value).toBeUndefined()
    })
    it("should log trace upon error", async () => {
      const consoleSpy = jest
        .spyOn(console, "trace")
        .mockImplementation(() => {})
      await attempt(async () => {
        throw new Error()
      })
      expect(consoleSpy).toHaveBeenCalledTimes(1)
    })
    it("should log error message with trace", async () => {
      const consoleSpy = jest
        .spyOn(console, "trace")
        .mockImplementation(() => {})
      await attempt(async () => {
        throw new Error("message")
      })
      expect(consoleSpy).toHaveBeenCalledWith("message")
    })
    it("should log backup message with trace if no error message", async () => {
      const consoleSpy = jest
        .spyOn(console, "trace")
        .mockImplementation(() => {})
      await attempt(async () => {
        throw new Error()
      }, "message")
      expect(consoleSpy).toHaveBeenCalledWith("message")
    })
  })
})
