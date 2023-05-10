import { AuthEvent, Eventbus, EventType } from "../internal"

let eventbus: Eventbus
let mockListener: jest.Mock

beforeEach(() => {
  eventbus = new Eventbus()
  mockListener = jest.fn()
})

it("should add a listener", () => {
  eventbus.listen(EventType.AUTH, mockListener)
  expect(eventbus.size).toEqual(1)
})
it("should allow multiple listeners of the same type", () => {
  eventbus.listen(EventType.AUTH, mockListener)
  eventbus.listen(EventType.AUTH, mockListener)
  expect(eventbus.listenerCount(EventType.AUTH)).toEqual(2)
})
it("should allow multiple listeners of different types", async () => {
  eventbus.listen(EventType.AUTH, mockListener)
  eventbus.listen(EventType.MESSAGE_BATCH, mockListener)
  expect(eventbus.size).toEqual(2)
})
it("should call listeners on announce", async () => {
  eventbus.listen(EventType.AUTH, mockListener)
  eventbus.listen(EventType.AUTH, mockListener)
  await eventbus.announce(new AuthEvent(undefined))
  expect(mockListener).toHaveBeenCalledTimes(2)
})
it("should only call the correct listeners", async () => {
  eventbus.listen(EventType.AUTH, mockListener)
  eventbus.listen(EventType.MESSAGE_BATCH, mockListener)
  await eventbus.announce(new AuthEvent(undefined))
  expect(mockListener).toHaveBeenCalledTimes(1)
})
it("should remove a listener", async () => {
  eventbus.listen(EventType.AUTH, async (_, self) => {
    self.remove()
  })
  await eventbus.announce(new AuthEvent(undefined))
  expect(eventbus.listenerCount(EventType.AUTH)).toBe(0)
})
it("should log errors", async () => {
  const consoleSpy = jest.spyOn(console, "trace").mockImplementation(() => {})
  eventbus.listen(EventType.AUTH, async () => {
    throw new Error("message")
  })
  await eventbus.announce(new AuthEvent(undefined))
  expect(consoleSpy).toHaveBeenCalledWith("message")
  expect(consoleSpy).toHaveBeenCalledTimes(1)
})
