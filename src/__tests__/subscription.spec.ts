import { listOf, subscriber } from "./config"
import { checkSubscriptions, loadLastSub } from "../youtube/subscriber"
import youtube from "../youtube/apiClient"
import { announce } from "../event"
import file from "../util/file"

describe("Recent Subscription", () => {
  // 0 is "newest"
  const subs = listOf(3, (i) => subscriber(`CHANNEL_${i}`))

  let listSubscriptionsMock = jest
    .spyOn(youtube.subscriptions, "list")
    .mockImplementation(() => ({ data: { items: subs } }))

  beforeEach(async () => {
    await loadLastSub()
  })

  it("should request api info", async () => {
    await checkSubscriptions(false)
    expect(listSubscriptionsMock).toHaveBeenCalledTimes(1)
  })

  it("should announce each new subscription", async () => {
    await checkSubscriptions(false)
    expect(announce).toHaveBeenCalledTimes(subs.length)
  })

  it("should write newest subscription to file", async () => {
    await checkSubscriptions(false)
    expect(file.write).toHaveBeenCalledTimes(1)
    expect(file.write).toHaveReturnedWith(JSON.stringify(subs[0]))
  })
})
