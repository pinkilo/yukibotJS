import * as readline from "readline"
import * as process from "process"
import { processMessage } from "./yuki"
import env from "./env"

if (env.NODE_ENV === "test") {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  rl.on("line", (input) => {
    processMessage({
      kind: "youtube#liveChatMessage",
      id: "123",
      snippet: {
        type: "textMessageEvent",
        liveChatId: "ABC123",
        authorChannelId: "UCC5woRixgHKy-3iOOVSKwZA",
        publishedAt: new Date().toString(),
        hasDisplayContent: false,
        displayMessage: input,
      },
      authorDetails: {
        channelId: "UCC5woRixgHKy-3iOOVSKwZA",
        channelUrl: "CHANNEL_URL",
        displayName: "CHANNEL_DISPLAY_NAME",
        profileImageUrl: "CHANNEL_IMAGE_URL",
        isChatModerator: false,
      },
    }).then(() => {})
  })
}
