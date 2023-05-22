import {
  GoogleConfig,
  TestYuki,
  Yuki,
  YukiBuilder,
  YukiConfig,
} from "../../logic"

let googleConfig: GoogleConfig
const yukiConfig: YukiConfig = {
  name: "yuki",
  chatPollRate: 14.4,
  broadcastPollRate: 2 * 60,
  subscriptionPollRate: 60,
  prefix: /^([>!]|y!)$/gi,
}
let yukiBuilder: YukiBuilder

beforeEach(() => {
  googleConfig = {
    clientId: "client_id",
    clientSecret: "client_secret",
    redirectUri: "redirect_uri",
  }
  yukiBuilder = new YukiBuilder()
})

describe("failure conditions", () => {
  describe("google config", () => {
    beforeEach(() => {
      yukiBuilder.tokenLoader = async () => undefined
    })
    it("should fail if googleConfig is not set", () => {
      expect(yukiBuilder.build()).toBeUndefined()
    })
    it("should fail if clientId is undefined", () => {
      yukiBuilder.googleConfig = {
        ...googleConfig,
        clientId: undefined,
      }
      expect(yukiBuilder.build()).toBeUndefined()
    })
    it("should fail if clientSecret is undefined", () => {
      yukiBuilder.googleConfig = {
        ...googleConfig,
        clientSecret: undefined,
      }
      expect(yukiBuilder.build()).toBeUndefined()
    })
    it("should fail if redirectUri is undefined", () => {
      yukiBuilder.googleConfig = {
        ...googleConfig,
        redirectUri: undefined,
      }
      expect(yukiBuilder.build()).toBeUndefined()
    })
  })
  it("should fail if tokenLoader is not set", () => {
    yukiBuilder.googleConfig = googleConfig
    expect(yukiBuilder.build()).toBeUndefined()
  })
})
describe("success conditions", () => {
  beforeEach(() => {
    yukiBuilder.googleConfig = googleConfig
    yukiBuilder.tokenLoader = async () => undefined
  })
  it("should build yuki when test is undefined", () => {
    yukiBuilder.yukiConfig.test = undefined
    expect(yukiBuilder.build()).toBeInstanceOf(Yuki)
  })
  it("should build yuki when test is false", () => {
    yukiBuilder.yukiConfig.test = false
    expect(yukiBuilder.build()).toBeInstanceOf(Yuki)
  })
  it("should build yuki when userCacheLoader is undefined", () => {
    yukiBuilder.userCacheLoader = undefined
    expect(yukiBuilder.build()).toBeInstanceOf(Yuki)
  })
  it("should build test yuki when test is true", () => {
    yukiBuilder.yukiConfig.test = true
    expect(yukiBuilder.build()).toBeInstanceOf(TestYuki)
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
