import { GoogleConfig, YukiBuilder } from "../../logic"

let googleConfig: GoogleConfig
let yukiBuilder: YukiBuilder
const mockFn = jest.fn()

beforeEach(() => {
  googleConfig = {
    clientId: "client_id",
    clientSecret: "client_secret",
    redirectUri: "redirect_uri",
  }
  yukiBuilder = new YukiBuilder()
  yukiBuilder.googleConfig = googleConfig
  yukiBuilder.tokenLoader = async () => undefined
})

it("should announce message", async () => {
  await yukiBuilder.onMessage(mockFn)
  const ty = yukiBuilder.buildTest()
  await ty.feedMessage("test")
  expect(mockFn).toHaveBeenCalledTimes(1)
})

it("should announce subscription", async () => {
  await yukiBuilder.onSubscription(mockFn)
  const ty = yukiBuilder.buildTest()
  await ty.feedSubscription()
  expect(mockFn).toHaveBeenCalledTimes(1)
})

it("should announce auth update", async () => {
  await yukiBuilder.onAuthUpdate(mockFn)
  const ty = yukiBuilder.buildTest()
  await ty.feedAuthUpdate()
  expect(mockFn).toHaveBeenCalledTimes(1)
})
