import { GoogleConfig } from "../../logic"
import { Eventbus, YoutubeWrapper } from "../../internal"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import winston from "winston"

jest.mock("google-auth-library")
jest.mock("googleapis")

const googleConfig: GoogleConfig = {
  clientId: "client_id",
  clientSecret: "client_secret",
  redirectUri: "redirect_uri",
}
let youtubeWrapper: YoutubeWrapper
let logger: winston.Logger
let eventbus: Eventbus

beforeEach(() => {
  logger = winston.createLogger()
  eventbus = new Eventbus()
  youtubeWrapper = new YoutubeWrapper(
    googleConfig.clientId,
    googleConfig.clientSecret,
    googleConfig.redirectUri,
    logger
  )
})

it("should start with empty call history", () => {
  expect(youtubeWrapper.callHistory).toEqual([])
})

it("should record collective call history", async () => {
  await youtubeWrapper.subscriptions.fetchRecentSubscriptions()
  expect(youtubeWrapper.callHistory.length).toEqual(1)
  expect(youtubeWrapper.callHistory[0]).toEqual(
    expect.objectContaining({ type: "list/subscription" })
  )

  await youtubeWrapper.broadcasts.fetchBroadcast()
  expect(youtubeWrapper.callHistory.length).toEqual(2)
  expect(youtubeWrapper.callHistory[0]).toEqual(
    expect.objectContaining({ type: "list/broadcast" })
  )

  await youtubeWrapper.broadcasts.fetchChatMessages()
  expect(youtubeWrapper.callHistory.length).toEqual(3)
  expect(youtubeWrapper.callHistory[0]).toEqual(
    expect.objectContaining({ type: "list/message" })
  )

  await youtubeWrapper.fetchUsers([])
  expect(youtubeWrapper.callHistory.length).toEqual(4)
  expect(youtubeWrapper.callHistory[0]).toEqual(
    expect.objectContaining({ type: "list/user" })
  )
})
