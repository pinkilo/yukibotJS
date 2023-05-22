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
    it("should fail if googleConfig is not set", async () => {
      expect(await yukiBuilder.buildYuki()).toBeUndefined()
    })
    it("should fail if clientId is undefined", async () => {
      yukiBuilder.googleConfig = {
        ...googleConfig,
        clientId: undefined,
      }
      expect(await yukiBuilder.buildYuki()).toBeUndefined()
    })
    it("should fail if clientSecret is undefined", async () => {
      yukiBuilder.googleConfig = {
        ...googleConfig,
        clientSecret: undefined,
      }
      expect(await yukiBuilder.buildYuki()).toBeUndefined()
    })
    it("should fail if redirectUri is undefined", async () => {
      yukiBuilder.googleConfig = {
        ...googleConfig,
        redirectUri: undefined,
      }
      expect(await yukiBuilder.buildYuki()).toBeUndefined()
    })
  })
  it("should fail if tokenLoader is not set", async () => {
    yukiBuilder.googleConfig = googleConfig
    expect(await yukiBuilder.buildYuki()).toBeUndefined()
  })
})
describe("success conditions", () => {
  beforeEach(() => {
    yukiBuilder.googleConfig = googleConfig
    yukiBuilder.tokenLoader = async () => undefined
  })
  it("should build yuki when test is undefined", async () => {
    yukiBuilder.yukiConfig.test = undefined
    expect(await yukiBuilder.buildYuki()).toBeInstanceOf(Yuki)
  })
  it("should build yuki when test is false", async () => {
    yukiBuilder.yukiConfig.test = false
    expect(await yukiBuilder.buildYuki()).toBeInstanceOf(Yuki)
  })
  it("should build yuki when userCacheLoader is undefined", async () => {
    yukiBuilder.userCacheLoader = undefined
    expect(await yukiBuilder.buildYuki()).toBeInstanceOf(Yuki)
  })
  it("should build test yuki when test is true", async () => {
    yukiBuilder.yukiConfig.test = true
    expect(await yukiBuilder.buildYuki()).toBeInstanceOf(TestYuki)
  })
})
describe("build confirmation", () => {
  it("should retain config", async () => {
    yukiBuilder.googleConfig = googleConfig
    yukiBuilder.tokenLoader = async () => undefined
    yukiBuilder.yukiConfig = yukiConfig
    const yuki = await yukiBuilder.buildYuki()
    expect(yuki.config).toEqual(yukiConfig)
  })
})
