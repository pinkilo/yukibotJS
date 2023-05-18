import { google, youtube_v3 } from "googleapis"
import { OAuth2Client } from "google-auth-library"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import winston from "winston"
import SubscriptionsHandler from "../../internal/google/SubscriptionsHandler"
import { gaxiosResponse, listOf } from "../util"
import Schema$Subscription = youtube_v3.Schema$Subscription
import Schema$SubscriptionListResponse = youtube_v3.Schema$SubscriptionListResponse

jest.mock("google-auth-library")

let ytClient: youtube_v3.Youtube
let auth: OAuth2Client
let logger: winston.Logger
let subscriptionsHandler: SubscriptionsHandler
let listSpy: jest.SpyInstance
let subs: Schema$Subscription[]

beforeEach(() => {
  logger = winston.createLogger()
  auth = new OAuth2Client()
  ytClient = google.youtube("v3")
  subscriptionsHandler = new SubscriptionsHandler(ytClient, auth, logger)
  const now = Date.now()
  subs = listOf<Schema$Subscription>(6, (i) => ({
    id: `sub_${i}`,
    snippet: { publishedAt: new Date(now + i * 1000).toISOString() },
  }))
  listSpy = jest
    .spyOn(ytClient.subscriptions, "list")
    .mockName("fetchRecentSubscriptions")
})

describe("Fetch Subscriptions", () => {
  it("should make api request", async () => {
    await subscriptionsHandler.fetchRecentSubscriptions()
    expect(listSpy).toHaveBeenCalledTimes(1)
  })
  it("should return new subscriptions in latest->oldest order", async () => {
    listSpy.mockImplementation(() =>
      gaxiosResponse<Schema$SubscriptionListResponse>({ items: subs }, 200)
    )
    const { success, value } =
      await subscriptionsHandler.fetchRecentSubscriptions()
    expect(success).toBe(true)
    expect(value.length).toBe(subs.length)
    for (let i = 0; i < value.length; i++) {
      expect(value[i]).toBe(subs[i])
    }
  })
  it("should handle failed request", async () => {
    listSpy.mockImplementation(() => {
      throw new Error()
    })
    const { success, value } =
      await subscriptionsHandler.fetchRecentSubscriptions()
    expect(success).toBe(false)
    expect(value).toBeUndefined()
  })
})

describe("subscription history", () => {
  it("should add new subscriptions to history in latest->oldest order", async () => {
    listSpy
      .mockImplementationOnce(() =>
        gaxiosResponse<Schema$SubscriptionListResponse>(
          { items: subs.slice(3) },
          200
        )
      )
      .mockImplementationOnce(() =>
        gaxiosResponse<Schema$SubscriptionListResponse>(
          { items: subs.slice(0, 3) },
          200
        )
      )

    await subscriptionsHandler.fetchRecentSubscriptions()
    await subscriptionsHandler.fetchRecentSubscriptions()
    for (let i = 0; i < subscriptionsHandler.history.length - 1; i++) {
      const timeOfA = new Date(
        subscriptionsHandler.history[i].snippet.publishedAt
      ).getTime()
      const timeOfB = new Date(
        subscriptionsHandler.history[i + 1].snippet.publishedAt
      ).getTime()
      expect(timeOfA).toBeGreaterThan(timeOfB)
    }
  })
  it("should not add subscriptions already in memory", async () => {
    listSpy.mockImplementation(async () =>
      gaxiosResponse<Schema$SubscriptionListResponse>(
        { items: subs.slice(0, 3) },
        200
      )
    )
    await subscriptionsHandler.fetchRecentSubscriptions()
    expect(subscriptionsHandler.history.length).toBe(3)
    for (let i = 0; i < 3; i++) {
      expect(subscriptionsHandler.history).toContain(subs[i])
    }

    await subscriptionsHandler.fetchRecentSubscriptions()
    expect(subscriptionsHandler.history.length).toBe(3)
    for (let i = 0; i < 3; i++) {
      expect(subscriptionsHandler.history).toContain(subs[i])
    }
  })
  it("should not modify history without new subscriptions", async () => {
    listSpy.mockImplementation(async () =>
      gaxiosResponse<Schema$SubscriptionListResponse>({ items: [] }, 200)
    )
    await subscriptionsHandler.fetchRecentSubscriptions()
    expect(subscriptionsHandler.history.length).toBe(0)
  })
})
