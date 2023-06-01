import ConditionalInterval from "../internal/ConditionalInterval"

jest.useFakeTimers()

const delay = 1000
const callback = jest.fn()

let watcher: ConditionalInterval

beforeEach(() => {
  watcher = new ConditionalInterval(delay, callback)
  jest.clearAllTimers()
  jest.restoreAllMocks()
})

it("should set interval for given delay", async () => {
  const timerSpy = jest.spyOn(global, "setTimeout")
  await watcher.run()
  watcher.stop()
  expect(timerSpy).toHaveBeenCalledWith(expect.any(Function), delay)
})

it("should wait between each invocation", async () => {
  await watcher.run()
  expect(callback).toHaveBeenCalledTimes(1)
  await jest.advanceTimersToNextTimerAsync()
  expect(callback).toHaveBeenCalledTimes(2)
})

it("should not invoke after stop", async () => {
  await watcher.run()
  watcher.stop()
  await jest.advanceTimersToNextTimerAsync(3)
  expect(callback).toHaveBeenCalledTimes(1)
})
