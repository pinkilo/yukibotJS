import * as winston from "winston"
import CommandBuilder from "../../logic/commands/CommandBuilder"
import { chatMessage } from "../util"
import { Command } from "../../logic/commands"
import { tokenize } from "../../logic/tokenization"

let cmdBuilder: CommandBuilder

beforeEach(() => {
  cmdBuilder = new CommandBuilder(winston.createLogger())
})

const msg = chatMessage(`>test`)
describe("failure conditions", () => {
  it("should not allow missing invoke", () => {
    cmdBuilder.name = "commandname"
    expect(cmdBuilder.build()).toBeUndefined()
  })
  describe("name restrictions", () => {
    beforeEach(() => {
      cmdBuilder.invoke = async () => ({
        /**/
      })
    })
    it("should not allow missing name", () => {
      cmdBuilder.name = undefined
      expect(cmdBuilder.build()).toBeUndefined()
    })
    it("should not allow malformed name", () => {
      cmdBuilder.name = "n ame"
      expect(cmdBuilder.build()).toBeUndefined()
    })
    it("should not allow malformed alias", () => {
      cmdBuilder.name = "command_name"
      cmdBuilder.alias = ["other name"]
      expect(cmdBuilder.build()).toBeUndefined()
    })
  })
})
describe("success conditions", () => {
  beforeEach(() => {
    cmdBuilder.invoke = async () => ({
      /**/
    })
  })
  it("should allow valid name and missing alias", () => {
    cmdBuilder.name = "commandname"
    expect(cmdBuilder.build()).toBeInstanceOf(Command)
  })
  it("should allow single emoji as name", () => {
    cmdBuilder.name = "🫘"
    expect(cmdBuilder.build()).toBeInstanceOf(Command)
  })
  it("should allow multiple emoji as name", () => {
    cmdBuilder.name = "🫘🫘🫘"
    expect(cmdBuilder.build()).toBeInstanceOf(Command)
  })
  it("should allow valid alias", () => {
    cmdBuilder.name = "commandname"
    cmdBuilder.alias = ["otherName", "🫘", "🫘🫘🫘"]
    expect(cmdBuilder.build()).toBeInstanceOf(Command)
  })
  it("should allow missing ratelimits", () => {
    cmdBuilder.name = "commandname"
    cmdBuilder.rateLimit.individual = undefined
    cmdBuilder.rateLimit.global = undefined
    expect(cmdBuilder.build()).toBeInstanceOf(Command)
    cmdBuilder.rateLimit.individual = 0
    expect(cmdBuilder.build()).toBeInstanceOf(Command)
    cmdBuilder.rateLimit.global = 0
    expect(cmdBuilder.build()).toBeInstanceOf(Command)
  })
})
describe("build confirmation", () => {
  it("should build a command with the same name", () => {
    cmdBuilder.name = "commandname"
    cmdBuilder.invoke = async () => {
      /**/
    }
    const cmd = cmdBuilder.build()
    expect(cmd.name).toBe(cmdBuilder.name)
  })
  it("should build a command with the same alias", () => {
    cmdBuilder.name = "commandname"
    cmdBuilder.alias = ["otherName", "anotherName"]
    cmdBuilder.invoke = async () => {
      /**/
    }
    const cmd = cmdBuilder.build()
    for (let i = 0; i < cmdBuilder.alias.length; i++) {
      expect(cmd.alias).toContain(cmdBuilder.alias[i])
    }
  })
  it("should build a command with the same '>0' rate limits", () => {
    cmdBuilder.name = "commandname"
    cmdBuilder.rateLimit.global = 1
    cmdBuilder.rateLimit.individual = 2
    cmdBuilder.invoke = async () => {
      /**/
    }
    const cmd = cmdBuilder.build()
    expect(cmd.ratelimit).toBe(cmdBuilder.rateLimit.individual)
    expect(cmd.globalRateLimit).toBe(cmdBuilder.rateLimit.global)
  })
  it("should handle negative ratelimits", () => {
    cmdBuilder.name = "commandname"
    cmdBuilder.rateLimit.global = -1
    cmdBuilder.rateLimit.individual = -1
    cmdBuilder.invoke = async () => {
      /**/
    }
    const cmd = cmdBuilder.build()
    expect(cmd.ratelimit).toBeGreaterThanOrEqual(0)
    expect(cmd.globalRateLimit).toBeGreaterThanOrEqual(0)
  })
  it("should build a command with the same invoke", async () => {
    cmdBuilder.name = "commandname"
    const returnVal = 20
    cmdBuilder.invoke = async () => 20
    const cmd = cmdBuilder.build()
    const result = await cmd.invoke(
      msg,
      tokenize(msg.snippet.displayMessage, /^>/),
      cmd
    )
    expect(result).toBe(returnVal)
  })
})
