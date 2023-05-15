import { attempt } from "../internal"
import { tokenize } from "../logic/tokenization"

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
    const consoleSpy = jest.spyOn(console, "trace").mockImplementation(() => {})
    await attempt(async () => {
      throw new Error()
    })
    expect(consoleSpy).toHaveBeenCalledTimes(1)
  })
  it("should log error message with trace", async () => {
    const consoleSpy = jest.spyOn(console, "trace").mockImplementation(() => {})
    await attempt(async () => {
      throw new Error("message")
    })
    expect(consoleSpy).toHaveBeenCalledWith("message")
  })
  it("should log backup message with trace if no error message", async () => {
    const consoleSpy = jest.spyOn(console, "trace").mockImplementation(() => {})
    await attempt(async () => {
      throw new Error()
    }, "message")
    expect(consoleSpy).toHaveBeenCalledWith("message")
  })
})

describe("Tokenization", () => {
  const prefix = /^>/
  it("should recognize command token as command", () => {
    const cmdMsg = ">cmd"
    const tokens = tokenize(cmdMsg, prefix)
    expect(tokens.isCommand).toBe(true)
    expect(tokens.command).toBe(cmdMsg.slice(1))
  })
  it("should not recognize non-command token as command", () => {
    const tokens = tokenize("!cmd", prefix)
    expect(tokens.isCommand).toBe(false)
    expect(tokens.command).toBeNull()
  })
})
