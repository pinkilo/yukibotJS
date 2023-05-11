import Yuki, { GoogleConfig, YukiConfig } from "../../yuki/Yuki"
import {
  AuthEvent,
  BroadcastUpdateEvent,
  Eventbus,
  successOf,
  YoutubeWrapper,
} from "../../internal"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import winston from "winston"
import { Credentials } from "google-auth-library"
import * as supertest from "supertest"

jest.mock("google-auth-library")
jest.mock("googleapis")

const googleConfig: GoogleConfig = {
  clientId: "client_id",
  clientSecret: "client_secret",
  redirectUri: "redirect_uri",
}
const yukiConfig: YukiConfig = {
  name: "yuki",
  chatPollRate: 14.4 * 1000,
  broadcastPollRate: 2 * 60 * 1000,
  subscriptionPollRate: 60 * 1000,
  prefix: /^([>!]|y!)$/gi,
}
const tokens: Credentials = {
  refresh_token: null,
  expiry_date: null,
  access_token: null,
  token_type: null,
  id_token: null,
  scope: null,
}
let yuki: Yuki
let youtubeWrapper: YoutubeWrapper
let logger: winston.Logger
let tokenLoader: jest.Mock
let eventbus: Eventbus

beforeEach(() => {
  tokenLoader = jest.fn()
  logger = winston.createLogger()
  eventbus = new Eventbus()
  youtubeWrapper = new YoutubeWrapper(
    googleConfig.clientId,
    googleConfig.clientSecret,
    googleConfig.redirectUri,
    logger
  )
  yuki = new Yuki(yukiConfig, youtubeWrapper, tokenLoader, eventbus, logger)
})

describe("startup", () => {
  describe("startup failure", () => {
    it("should fail if tokenLoader invalid", async () => {
      tokenLoader.mockImplementation(async () => undefined)
      const started = await yuki.start()
      expect(started).toBe(false)
    })
    it("should fail if tokenLoader fails", async () => {
      tokenLoader.mockImplementation(async () => {
        throw new Error()
      })
      const started = await yuki.start()
      expect(started).toBe(false)
    })
    it("should fail if already running", async () => {
      tokenLoader.mockImplementation(async () => tokens)
      expect(await yuki.start()).toBe(true)
      expect(await yuki.start()).toBe(false)
    })
    it("should not fetch broadcast", async () => {
      const spy = jest.spyOn(youtubeWrapper.broadcasts, "fetchBroadcast")
      await yuki.start()
      expect(spy).toHaveBeenCalledTimes(0)
    })
    it("should should not add broadcast listener for chat watcher", async () => {
      const listenSpy = jest.spyOn(eventbus, "listen")
      await yuki.start()
      expect(listenSpy).toHaveBeenCalledTimes(0)
    })
  })
  describe("startup success", () => {
    beforeEach(() => {
      tokenLoader.mockImplementation(async () => tokens)
    })
    it("should start with valid token loader", async () => {
      expect(await yuki.start()).toBe(true)
    })
    it("should call token loader", async () => {
      await yuki.start()
      expect(tokenLoader).toHaveBeenCalledTimes(1)
    })
    it("should fetch broadcast", async () => {
      const spy = jest.spyOn(youtubeWrapper.broadcasts, "fetchBroadcast")
      await yuki.start()
      expect(spy).toHaveBeenCalled()
    })
    it("should fetch subscriptions", async () => {
      const spy = jest.spyOn(
        youtubeWrapper.subscriptions,
        "fetchRecentSubscriptions"
      )
      await yuki.start()
      expect(spy).toHaveBeenCalled()
    })
    it("should should add broadcast listener for chat watcher", async () => {
      const fetchChatSpy = jest.spyOn(
        youtubeWrapper.broadcasts,
        "fetchChatMessages"
      )
      await yuki.start()
      await eventbus.announce(new BroadcastUpdateEvent(undefined))
      expect(fetchChatSpy).toHaveBeenCalledTimes(1)
    })
  })
})

describe("express app", () => {
  beforeEach(() => {
    tokenLoader.mockImplementation(async () => tokens)
  })
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
