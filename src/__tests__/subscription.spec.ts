import { listOf, subscriber } from "./config"
import { checkSubscriptions } from "../youtube/subscriber"
import youtube from "../youtube/apiClient"
import { announce } from "../event"
import file from "../util/file"

jest.mock("../event", () => ({
  __esModule: true,
  ...jest.requireActual("../event"),
  announce: jest.fn(),
}))

let listSubscriptionsMock = jest
  .spyOn(youtube.subscriptions, "list")
  .mockImplementation(() => ({
    data: {
      items: listOf(3, (i) => subscriber(`CHANNEL_${ i }`)),
    },
  }))

describe("Recent Subscription", () => {

  it("should request api info", async () => {
    await checkSubscriptions(false)
    expect(listSubscriptionsMock).toHaveBeenCalledTimes(1)
  })

  it("should announce each new subscription", async () => {
    await checkSubscriptions(false)
    expect(announce).toHaveBeenCalledTimes(3)
  })

  it("should write each new subscription to file", async () => {
    await checkSubscriptions(false)
    expect(file.write).toHaveBeenCalledTimes(3)
  })
})
