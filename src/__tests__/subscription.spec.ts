import { listOf, subscriber } from "./util"
import {
  updateSubscriptionsLoop,
  getMostRecentSub,
} from "../youtube/subscriptions"
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
    await getMostRecentSub()
  })

  it("should request api info", async () => {
    await updateSubscriptionsLoop(false)
    expect(listSubscriptionsMock).toHaveBeenCalledTimes(1)
  })

  it("should announce each new subscription", async () => {
    await updateSubscriptionsLoop(false)
    expect(announce).toHaveBeenCalledTimes(subs.length)
  })

  it("should write newest subscription to file", async () => {
    await updateSubscriptionsLoop(false)
    expect(file.write).toHaveBeenCalledTimes(1)
    expect(file.write).toHaveReturnedWith(JSON.stringify(subs[0]))
  })
})
