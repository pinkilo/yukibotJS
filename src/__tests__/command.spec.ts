import Command from "../yuki/commands/Command"
import { chatMessage } from "./util"
import { tokenize } from "../yuki/tokenization"
import * as winston from "winston"

jest.mock("winston")

let command: Command
let addCooldownMock
let checkCooldownMock
let commandInvokeMock

beforeEach(() => {
  command = new Command("test", [], 1, 0, winston.createLogger(), async () => {
    /**/
  })
  addCooldownMock = jest
    .spyOn(command, "addCooldown")
    .mockImplementation(() => {
      /**/
    })
  checkCooldownMock = jest.spyOn(command, "onCooldown")
  commandInvokeMock = jest.spyOn(command, "invoke")
})

const msg = chatMessage(`>test`)
describe("Command", () => {
  describe("command invoke", () => {
    it("should invoke command", async () => {
      await command.execute(msg, tokenize(msg.snippet.displayMessage))
      expect(commandInvokeMock).toBeCalledTimes(1)
    })
  })

  describe("cooldown", () => {
    beforeEach(() => {
      command = new Command(
        "test",
        [],
        0,
        100,
        winston.createLogger(),
        async () => {
          /**/
        }
      )
      addCooldownMock = jest.spyOn(command, "addCooldown")
      checkCooldownMock = jest.spyOn(command, "onCooldown")
    })
    it("should add cooldown once", async () => {
      await command.execute(msg, tokenize(msg.snippet.displayMessage))
      expect(addCooldownMock).toBeCalledTimes(1)
    })
    it("should check cooldown once", async () => {
      await command.execute(msg, tokenize(msg.snippet.displayMessage))
      expect(checkCooldownMock).toBeCalledTimes(1)
    })
    it("should be on cooldown", async () => {
      await command.execute(msg, tokenize(msg.snippet.displayMessage))
      expect(command.onCooldown(msg.authorDetails.channelId)).toBe(true)
    })
  })
})
