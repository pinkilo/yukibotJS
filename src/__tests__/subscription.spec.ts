import { listOf, subscriber } from "./util"

describe("Recent Subscription", () => {
  // 0 is "newest"
  const subs = listOf(3, (i) => subscriber(`CHANNEL_${i}`))
  const mostRecent = subs[0]

  let listSubscriptionsMock
  let youtube: typeof import("../youtube").default
  let announce: typeof import("../event").announce
  let file: typeof import("../util/file").default

  beforeEach(async () => {
    jest.resetModules()
    file = (await import("../util/file")).default
    announce = (await import("../event")).announce
    youtube = (await import("../youtube")).default
    const ytApiClient = (await import("../youtube/apiClient")).default
    listSubscriptionsMock = jest
      .spyOn(ytApiClient.subscriptions, "list")
      .mockImplementation(() => ({ data: { items: subs } }))
  })

  it("should request api info", async () => {
    await youtube.subscriptions.updateSubscriptionsLoop(false)
    expect(listSubscriptionsMock).toHaveBeenCalledTimes(1)
  })

  it("should announce each new subscription", async () => {
    await youtube.subscriptions.updateSubscriptionsLoop(false)
    expect(announce).toHaveBeenCalledTimes(subs.length)
  })

  it("should write newest subscription to file", async () => {
    await youtube.subscriptions.updateSubscriptionsLoop(false)
    expect(file.write).toHaveBeenCalledTimes(1)
    expect(file.write).toHaveReturnedWith(JSON.stringify(mostRecent))
  })
})
