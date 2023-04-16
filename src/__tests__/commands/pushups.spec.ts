import { Pushups } from "../../yuki/commands/Redemptions"
import { chatMessage } from "../config"
import { tokenize } from "../../yuki/processing"
import youtube from "../../youtube"

jest.mock("../../util/file")
jest.mock("../../youtube")

const msg = chatMessage(`>${Pushups.name}`)
describe("Command PUSHUPS", function () {
  it("should send message once", async () => {
    await Pushups.execute(msg, tokenize(msg.snippet.displayMessage))
    expect(youtube.chat.sendMessage).toBeCalledTimes(1)
  })
})
