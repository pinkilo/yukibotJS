import { youtube_v3 } from "googleapis"
import Schema$LiveChatMessage = youtube_v3.Schema$LiveChatMessage

export const createMessage = (text: string): Schema$LiveChatMessage => {
  return {
    kind: "youtube#liveChatMessage",
    id: "123",
    snippet: {
      type: "textMessageEvent",
      liveChatId: "ABC123",
      authorChannelId: "CHANNEL_ID",
      publishedAt: new Date().toString(),
      hasDisplayContent: false,
      displayMessage: text,
    },
    authorDetails: {
      channelId: "CHANNEL_ID",
      channelUrl: "CHANNEL_URL",
      displayName: "CHANNEL_DISPLAY_NAME",
      profileImageUrl: "CHANNEL_IMAGE_URL",
      isChatModerator: false,
    },
  }
}
