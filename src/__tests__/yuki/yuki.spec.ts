import { GoogleConfig, Yuki, YukiConfig } from "../../logic"
import {
  AsyncCache,
  AuthEvent,
  BroadcastUpdateEvent,
  cIntervalOf,
  createMessage,
  createSubscription,
  Eventbus,
  EventType,
  failure,
  MessageBatchEvent,
  secondsOf,
  SubscriptionEvent,
  successOf,
  YoutubeWrapper,
} from "../../internal"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import winston from "winston"
import { Credentials } from "google-auth-library"
import * as supertest from "supertest"
import { User } from "../../models"
import { youtube_v3 } from "googleapis"
import Schema$LiveChatMessage = youtube_v3.Schema$LiveChatMessage

jest.useFakeTimers()
jest.mock("google-auth-library")
jest.mock("googleapis")
jest.mock("../../internal/events/Event", () => {
  const actual: typeof import("../../internal/events/Event") =
    jest.requireActual("../../internal/events/Event")
  return {
    __esModule: true,
    ...actual,
    MessageBatchEvent: jest
      .fn((incoming) => new actual.MessageBatchEvent(incoming))
      .mockName("MessageBatchEvent.Constructor"),
    SubscriptionEvent: jest
      .fn((incoming) => new actual.SubscriptionEvent(incoming))
      .mockName("SubscriptionEvent.Constructor"),
  }
})
jest.mock("../../internal/ConditionalInterval", () => {
  const actual: typeof import("../../internal/ConditionalInterval") =
    jest.requireActual("../../internal/ConditionalInterval")
  return {
    __esModule: true,
    cIntervalOf: jest.fn((a, b) => actual.cIntervalOf(a, b)),
    default: jest
      .fn((delay, callback) => new actual.default(delay, callback))
      .mockName("ConditionalInterval.Constructor"),
  }
})

const googleConfig: GoogleConfig = {
  clientId: "client_id",
  clientSecret: "client_secret",
  redirectUri: "redirect_uri",
}
const yConfig: YukiConfig = {
  name: "yuki",
  chatPollRate: 14.4,
  broadcastPollRate: 2 * 60,
  subscriptionPollRate: 60,
  prefix: /^([>!]|y!)$/gi,
}
let tokens: Credentials = {
  refresh_token: null,
  expiry_date: null,
  access_token: null,
  token_type: null,
  scope: null,
}
let yuki: Yuki
let youtubeWrapper: YoutubeWrapper
let logger: winston.Logger
let eventbus: Eventbus
let usercache: AsyncCache<User>
let tokenLoader: jest.Mock
let userCacheLoader: jest.Mock
let fetchBroadcastSpy: jest.SpyInstance
let fetchSubsSpy: jest.SpyInstance
let fetchChatSpy: jest.SpyInstance

beforeEach(() => {
  tokens = {
    refresh_token: "123",
    access_token: "123",
    expiry_date: 123,
    scope: "123",
    token_type: "123",
  }
  tokenLoader = jest.fn(() => failure())
  userCacheLoader = jest.fn(() => failure())
  logger = winston.createLogger()
  eventbus = new Eventbus()
  youtubeWrapper = new YoutubeWrapper(
    googleConfig.clientId,
    googleConfig.clientSecret,
    googleConfig.redirectUri,
    logger
  )
  usercache = new AsyncCache<User>(logger, jest.fn())

  yuki = new Yuki(
    yConfig,
    youtubeWrapper,
    tokenLoader,
    userCacheLoader,
    undefined,
    usercache,
    eventbus,
    logger
  )

  fetchBroadcastSpy = jest
    .spyOn(youtubeWrapper.broadcasts, "fetchBroadcast")
    .mockImplementation(async () => failure())
  fetchSubsSpy = jest
    .spyOn(youtubeWrapper.subscriptions, "fetchRecentSubscriptions")
    .mockImplementation(async () => failure())
  fetchChatSpy = jest
    .spyOn(youtubeWrapper.broadcasts, "fetchChatMessages")
    .mockImplementation(async () => failure())
})

afterEach(() => {
  jest.clearAllTimers()
})

describe("startup", () => {
  describe("startup failure", () => {
    it("should fail if tokenLoader fails", async () => {
      tokenLoader.mockImplementation(() => failure())
      const started = await yuki.start()
      expect(started).toBe(false)
    })
    it("should fail if already running", async () => {
      tokenLoader.mockImplementation(async () => successOf(tokens))
      expect(await yuki.start()).toBe(true)
      expect(await yuki.start()).toBe(false)
    })
    it("should not fetch broadcast", async () => {
      await yuki.start()
      expect(fetchBroadcastSpy).toHaveBeenCalledTimes(0)
    })
    it("should should not add broadcast listener for chat watcher", async () => {
      const listenSpy = jest.spyOn(eventbus, "listen")
      await yuki.start()
      expect(listenSpy).toHaveBeenCalledTimes(0)
    })
  })
  describe("startup success", () => {
    beforeEach(() => {
      tokens = {
        refresh_token: "123",
        access_token: "123",
        expiry_date: 123,
        scope: "123",
        token_type: "123",
      }
      tokenLoader.mockImplementation(async () => successOf(tokens))
    })
    describe("token loader", () => {
      it("should start with successful token loading", async () => {
        expect(await yuki.start()).toBe(true)
      })
      it("should call token loader", async () => {
        await yuki.start()
        expect(tokenLoader).toHaveBeenCalledTimes(1)
      })
    })
    describe("user cache loader", () => {
      it("should call user cache loader", async () => {
        await yuki.start()
        expect(userCacheLoader).toHaveBeenCalledTimes(1)
      })
      it("should start if user cache loader undefined ", async () => {
        userCacheLoader = undefined
        expect(await yuki.start()).toBe(true)
      })
      it("should start if user cache loader fails ", async () => {
        userCacheLoader.mockImplementation(() => failure())
        expect(await yuki.start()).toBe(true)
      })
      it("should load cache values into internal usercache", async () => {
        const id = "_id"
        const user = new User(id, "name")
        userCacheLoader.mockImplementation(() => successOf({ _id: user }))
        await yuki.start()
        expect(await yuki.getUser(id)).toBe(user)
      })
    })
  })
})

describe("watchers", () => {
  beforeEach(() => {
    tokens = {
      refresh_token: "123",
      access_token: "123",
      expiry_date: 123,
      scope: "123",
      token_type: "123",
    }
    tokenLoader.mockImplementation(async () => successOf(tokens))
  })

  describe("subscription", () => {
    it(`should make interval of delay ${yConfig.subscriptionPollRate}sec`, async () => {
      yuki = new Yuki(
        yConfig,
        youtubeWrapper,
        tokenLoader,
        userCacheLoader,
        undefined,
        usercache,
        eventbus,
        logger
      )
      expect(cIntervalOf).toHaveBeenCalledWith(
        secondsOf(yConfig.subscriptionPollRate),
        expect.any(Function)
      )
    })
    it("should stop loop when not running", async () => {
      await yuki.start()
      yuki.stop()
      await jest.advanceTimersToNextTimerAsync()
      expect(fetchSubsSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe("broadcast", () => {
    it(`should make interval of delay ${yConfig.broadcastPollRate}sec`, async () => {
      expect(cIntervalOf).toHaveBeenCalledWith(
        secondsOf(yConfig.broadcastPollRate),
        expect.any(Function)
      )
    })
    it("should stop loop when not running", async () => {
      await yuki.start()
      yuki.stop()
      await jest.advanceTimersToNextTimerAsync()
      expect(fetchBroadcastSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe("chat", () => {
    it("should start chat watcher after broadcast update", async () => {
      const eventListenSpy = jest.spyOn(eventbus, "listen")
      await yuki.start()
      expect(eventListenSpy).toHaveBeenCalledWith(
        EventType.BROADCAST_UPDATE,
        expect.any(Function)
      )
      await eventbus.announce(new BroadcastUpdateEvent(undefined))
      expect(fetchChatSpy).toHaveBeenCalledTimes(1)
    })
    it(`should make interval of delay ${yConfig.broadcastPollRate}sec`, async () => {
      expect(cIntervalOf).toHaveBeenCalledWith(
        secondsOf(yConfig.broadcastPollRate),
        expect.any(Function)
      )
    })
    it("should stop loop when not running", async () => {
      await yuki.start()
      await eventbus.announce(new BroadcastUpdateEvent(undefined))
      yuki.stop()
      await jest.advanceTimersToNextTimerAsync()
      expect(fetchChatSpy).toHaveBeenCalledTimes(1)
    })
  })
})

describe("event announcements", () => {
  const oldDate = new Date(Date.now() / 2)
  const newDate = new Date(Date.now() * 2)
  let announceSpy

  beforeEach(() => {
    announceSpy = jest.spyOn(eventbus, "announce").mockName("announce")
    tokens = {
      refresh_token: "123",
      access_token: "123",
      expiry_date: 123,
      scope: "123",
      token_type: "123",
    }
    tokenLoader.mockImplementation(async () => successOf(tokens))
  })

  describe("Broadcast Update Event", () => {
    //it("should not announce if no broadcast", async () => {})
    it("should announce new broadcast", async () => {
      const bc = {}
      fetchBroadcastSpy.mockImplementation(async () => successOf(bc))
      await yuki.start()
      expect(announceSpy).toHaveBeenLastCalledWith(
        expect.objectContaining<BroadcastUpdateEvent>({
          type: EventType.BROADCAST_UPDATE,
          broadcast: bc,
        })
      )
    })
  })
  describe("Message Batch Event", () => {
    it("should not announce old messages", async () => {
      fetchChatSpy.mockImplementationOnce(async () => {
        return successOf([createMessage("old", oldDate.toISOString())])
      })
      await yuki.start()
      await eventbus.announce(new BroadcastUpdateEvent(undefined))
      expect(announceSpy).toHaveBeenCalledTimes(1)
      expect(MessageBatchEvent).toHaveBeenCalledTimes(0)
    })
    it("should announce new messages", async () => {
      const msg = createMessage("new", newDate.toISOString())
      await yuki.start()
      fetchChatSpy.mockImplementation(() => successOf([msg]))
      await eventbus.announce(new BroadcastUpdateEvent(undefined))
      expect(announceSpy).toHaveBeenLastCalledWith(
        expect.objectContaining<MessageBatchEvent>({
          type: EventType.MESSAGE_BATCH,
          incoming: expect.arrayContaining<Schema$LiveChatMessage>([msg]),
        })
      )
    })
  })
  describe("Subscription Event", () => {
    it("should not announce old subscription", async () => {
      fetchSubsSpy.mockImplementationOnce(async () => {
        return successOf([createSubscription(oldDate.toISOString())])
      })
      await yuki.start()
      expect(announceSpy).toHaveBeenCalledTimes(0)
      expect(SubscriptionEvent).toHaveBeenCalledTimes(0)
    })
    it("should announce new subscription", async () => {
      const sub = createSubscription(newDate.toISOString())
      fetchSubsSpy.mockImplementationOnce(async () => successOf([sub]))
      await yuki.start()
      expect(announceSpy).toHaveBeenLastCalledWith(
        expect.objectContaining<SubscriptionEvent>({
          type: EventType.SUBSCRIPTION,
          subscription: sub,
        })
      )
    })
  })
})

describe("express app", () => {
  it("GET root returns html page", () => {
    supertest
      .agent(yuki.express)
      .get("/")
      .expect("Content-Type", /html/)
      .expect(200)
  })
  it("GET /auth redirects to generated url", async () => {
    const redirect = "/redirect"
    const authUrlSpy = jest
      .spyOn(youtubeWrapper, "getAuthUrl")
      .mockName("getAuthUrl")
      .mockImplementation(() => redirect)
    await supertest
      .agent(yuki.express)
      .get("/auth")
      .expect("Location", new RegExp(redirect))
    expect(authUrlSpy).toHaveBeenCalledTimes(1)
  })
  describe("GET /callback", () => {
    it("should redirect home", () => {
      supertest
        .agent(yuki.express)
        .get("/callback")
        .expect(200)
        .expect("Location", new RegExp("/"))
    })
    describe("with code", () => {
      const code = "code"
      const tokens = {}
      let tokenFetchSpy: jest.SpyInstance
      beforeEach(() => {
        tokenFetchSpy = jest
          .spyOn(youtubeWrapper, "fetchTokensWithCode")
          .mockName("fetchTokensWithCode")
          .mockImplementation(async () => successOf(tokens))
      })
      it("should call token request", async () => {
        await supertest.agent(yuki.express).get(`/callback?code=${code}`)
        expect(tokenFetchSpy).toHaveBeenCalledTimes(1)
        expect(tokenFetchSpy).toHaveBeenCalledWith(code)
      })
      it("should set tokens", async () => {
        const tokenSetSpy = jest.spyOn(youtubeWrapper, "setTokens")
        await supertest.agent(yuki.express).get(`/callback?code=${code}`)
        expect(tokenSetSpy).toHaveBeenCalledTimes(1)
        expect(tokenSetSpy).toHaveBeenCalledWith(tokens)
      })
      it("should announce new tokens", async () => {
        let event: AuthEvent
        const announceSpy = jest
          .spyOn(eventbus, "announce")
          .mockName("announce")
          .mockImplementation(async (authEvent: AuthEvent) => {
            event = authEvent
          })
        await supertest.agent(yuki.express).get(`/callback?code=${code}`)
        expect(announceSpy).toHaveBeenCalledTimes(1)
        expect(event).toBeInstanceOf(AuthEvent)
        expect(event.credentials).toEqual(tokens)
      })
    })
  })
})
