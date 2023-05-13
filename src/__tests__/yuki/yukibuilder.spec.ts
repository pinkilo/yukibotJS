import YukiBuilder from "../../yuki/YukiBuilder"
import Yuki from "../../yuki/Yuki"
import { GoogleConfig, YukiConfig } from "../../yuki/BaseYuki"

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
let yukiBuilder: YukiBuilder

beforeEach(() => {
  yukiBuilder = new YukiBuilder()
})

describe("failure conditions", () => {
  it("should fail if googleConfig is not set", () => {
    yukiBuilder.tokenLoader = async () => undefined
    expect(yukiBuilder.build()).toBeUndefined()
  })
  it("should fail if tokenLoader is not set", () => {
    yukiBuilder.googleConfig = googleConfig
    expect(yukiBuilder.build()).toBeUndefined()
  })
})
describe("success conditions", () => {
  it("should succeed", () => {
    yukiBuilder.googleConfig = googleConfig
    yukiBuilder.tokenLoader = async () => undefined
    expect(yukiBuilder.build()).toBeInstanceOf(Yuki)
  })
})
describe("build confirmation", () => {
  it("should retain config", () => {
    yukiBuilder.googleConfig = googleConfig
    yukiBuilder.tokenLoader = async () => undefined
    yukiBuilder.yukiConfig = yukiConfig
    expect(yukiBuilder.build().config).toEqual(yukiConfig)
  })
})
