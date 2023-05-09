/*
 * TODO find a way to mock youtube api functions
 * TODO test express app
 */

import Yuki, { GoogleConfig, YukiConfig } from "../../yuki/Yuki"
import { Eventbus, YoutubeWrapper } from "../../internal"
import winston from "winston"
import { Credentials } from "google-auth-library"

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
  broadcastPollRage: 2 * 60 * 1000,
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
let evenbus: Eventbus

beforeEach(() => {
  tokenLoader = jest.fn()
  logger = winston.createLogger()
  evenbus = new Eventbus()
  youtubeWrapper = new YoutubeWrapper(
    googleConfig.clientId,
    googleConfig.clientSecret,
    googleConfig.redirectUri,
    logger
  )
  yuki = new Yuki(yukiConfig, youtubeWrapper, tokenLoader, evenbus, logger)
})

describe("Yuki", () => {
  describe("express app", () => {
    // TODO
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
    })
    describe("startup success", () => {
      it("should call token loader", async () => {
        tokenLoader.mockImplementation(async () => tokens)
        await yuki.start()
        expect(tokenLoader).toHaveBeenCalledTimes(1)
      })
      it("should start with valid token loader", async () => {
        tokenLoader.mockImplementation(async () => tokens)
        expect(await yuki.start()).toBe(true)
      })
    })
  })
})
