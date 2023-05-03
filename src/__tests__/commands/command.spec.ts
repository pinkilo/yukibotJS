import Command from "../../yuki/commands/Command"
import { chatMessage } from "../util"
import { tokenize } from "../../yuki/processing"
import MoneySystem from "../../yuki/MoneySystem"

jest.mock("../../util/file")
jest.mock("../../yuki/MoneySystem")

let command: Command
let addCooldownMock
let checkCooldownMock
let commandInvokeMock

beforeEach(() => {
  command = new Command("test", [], 1, 0, 0, async () => {})
  addCooldownMock = jest
    .spyOn(command, "addCooldown")
    .mockImplementation(() => {})
  checkCooldownMock = jest.spyOn(command, "onCooldown")
  commandInvokeMock = jest.spyOn(command, "invoke")
})

const cacheGetMock = jest
  .spyOn(MoneySystem.walletCache, "get")
  .mockImplementation(() => 1000)

const msg = chatMessage(`>test`)
describe("Command", () => {
  describe("predicate", () => {
    it("should check bank cache", async () => {
      await command.execute(msg, tokenize(msg.snippet.displayMessage))
      expect(cacheGetMock).toHaveBeenCalled()
    })
    it("should modify bank once", async () => {
      await command.execute(msg, tokenize(msg.snippet.displayMessage))
      expect(MoneySystem.transactionBatch).toBeCalledTimes(1)
    })
  })

  describe("command invoke", () => {
    it("should invoke command", async () => {
      await command.execute(msg, tokenize(msg.snippet.displayMessage))
      expect(commandInvokeMock).toBeCalledTimes(1)
    })
  })

  describe("cooldown", () => {
    beforeEach(() => {
      command = new Command("test", [], 0, 100, 0, async () => {})
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

  describe("payout", () => {
    let payoutMock
    beforeEach(() => {
      command = new Command("test", [], 0, 0, 0, async () => ({
        uids: [],
        amount: 0,
      }))
      payoutMock = jest.spyOn(command, "payout")
    })
    it("should payout", async () => {
      await command.execute(msg, tokenize(msg.snippet.displayMessage))
      expect(payoutMock).toBeCalledTimes(1)
      expect(MoneySystem.transactionBatch).toBeCalledTimes(2)
    })
  })
})
