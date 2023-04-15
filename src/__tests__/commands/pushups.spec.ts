import { Pushups } from "../../yuki/commands/Redemptions"
import { chatMessage } from "../config"
import { tokenize } from "../../yuki/processing"
import MoneySystem from "../../yuki/MoneySystem"
import youtube from "../../youtube"

jest.mock("../../youtube")
jest.mock("../../yuki/MoneySystem")

describe("Command PUSHUPS", function () {
  it("should modify bank", async ()  =>{
    const msg = chatMessage(`>${Pushups.name}`)
    await Pushups.invoke(msg, tokenize(msg.snippet.displayMessage), Pushups)
    expect(MoneySystem.transactionBatch).toHaveBeenCalled()
    expect(youtube.chat.sendMessage).toHaveBeenCalled()
  })
  it("should send message", async ()  =>{
    const msg = chatMessage(`>${Pushups.name}`)
    await Pushups.invoke(msg, tokenize(msg.snippet.displayMessage), Pushups)
    expect(youtube.chat.sendMessage).toHaveBeenCalled()
  })
})
