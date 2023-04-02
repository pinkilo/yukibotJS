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
      "kind": "youtube#liveChatMessage",
      "id": "123",
      "snippet": {
        "type": "textMessageEvent",
        "liveChatId": "ABC123",
        "authorChannelId": "CHANNEL_ID",
        "publishedAt": new Date().toString(),
        "hasDisplayContent": false,
        "displayMessage": input,
      },

      "authorDetails": {
        "channelId": "CHANNEL_ID",
        "channelUrl": "CHANNEL_URL",
        "displayName": "CHANNEL_DISPLAY_NAME",
        "profileImageUrl": "CHANNEL_IMAGE_URL",
        "isChatModerator": false,
      },
    }).then(() => {
    })
  })
}
