import { Pushups } from "../../yuki/commands/Redemptions"
import { chatMessage } from "../util"
import { tokenize } from "../../yuki/processing"
import youtube from "../../youtube"
import * as alerts from "../../yuki/alerts"

jest.mock("../../util/file")
jest.mock("../../youtube")

let addAlertMock = jest
  .spyOn(alerts, "enqueueNewAlert")
  .mockImplementation(async () => {})
let checkCooldownMock

const msg = chatMessage(`>${Pushups.name}`)
describe("Command PUSHUPS", () => {
  beforeEach(() => {
    addAlertMock = jest
      .spyOn(alerts, "enqueueNewAlert")
      .mockImplementation(async () => {})
    checkCooldownMock = jest
      .spyOn(Pushups, "onCooldown")
      .mockImplementation(() => false)
  })
  it("should send message once", async () => {
    await Pushups.execute(msg, tokenize(msg.snippet.displayMessage))
    expect(youtube.chat.sendMessage).toBeCalledTimes(1)
  })
  it("should add an alert", async () => {
    await Pushups.execute(msg, tokenize(msg.snippet.displayMessage))
    expect(addAlertMock).toBeCalledTimes(1)
  })
})
