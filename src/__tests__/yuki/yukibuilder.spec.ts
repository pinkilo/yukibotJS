import {
  GoogleConfig,
  testYuki,
  TestYuki,
  Yuki,
  YukiBuilder,
  YukiConfig,
} from "../../logic"
import { Credentials } from "google-auth-library"

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
  it("should fill required fields in test builder dsl", async () => {
    const ty = await testYuki(jest.fn())
    expect(ty).toBeInstanceOf(TestYuki)
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
describe("loader handling", () => {
  beforeEach(() => {
    yukiBuilder.googleConfig = googleConfig
  })

  describe("token loader", () => {
    const tokenLoader = jest.fn()
    let yuki: Yuki
    beforeEach(() => {
      yukiBuilder.tokenLoader = tokenLoader
    })

    it("should fail if token loader returns undefined", async () => {
      tokenLoader.mockImplementation(async () => undefined)
      yuki = await yukiBuilder.buildYuki()
      const started = await yuki.start()
      expect(started).toBe(false)
    })
    it("should fail if token loader throws", async () => {
      tokenLoader.mockImplementation(async () => {
        throw new Error()
      })
      yuki = await yukiBuilder.buildYuki()
      const started = await yuki.start()
      expect(started).toBe(false)
    })
  })
  describe("user cache loader", () => {
    const userCacheLoader = jest.fn()
    let yuki: Yuki
    beforeEach(() => {
      yukiBuilder.userCacheLoader = userCacheLoader
      yukiBuilder.tokenLoader = async () => ({
        refresh_token: "null",
        expiry_date: 123,
        access_token: "null",
        token_type: "null",
        scope: "null",
      })
    })
    it("should start if user cache loader returns undefined", async () => {
      userCacheLoader.mockImplementation(() => undefined)
      yuki = await yukiBuilder.buildYuki()
      expect(await yuki.start()).toBe(true)
    })
    it("should start if user cache loader trows", async () => {
      userCacheLoader.mockImplementation(() => {
        throw new Error()
      })
      yuki = await yukiBuilder.buildYuki()
      expect(await yuki.start()).toBe(true)
    })
  })
})
