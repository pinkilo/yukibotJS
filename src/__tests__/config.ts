import { youtube_v3 } from "googleapis"
import Schema$LiveChatMessage = youtube_v3.Schema$LiveChatMessage
import { factory } from "ts-jest/dist/transformers/hoist-jest"

export const chatMessage = (text: string): Schema$LiveChatMessage => ({
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
})

export const subscriber = (id: string = "CHANNEL_ID") => ({
  kind: "youtube#subscription",
  etag: "E_TAG",
  id: "SUBSCRIPTION_ID",
  subscriberSnippet: {
    title: "CHANNEL_TITLE",
    description: "",
    channelId: id,
    thumbnails: {
      default: {
        url: "THUMBNAIL_URI_DEFAULT",
      },
      medium: {
        url: "THUMBNAIL_URI_MED",
      },
      high: {
        url: "THUMBNAIL_URI_HIGH",
      },
    },
  },
})

export const listOf = <T extends any>(
  size: number,
  factory: (index: number) => T
): T[] => {
  const list: T[] = []
  for (let i = 0; i < size; i++) list.push(factory(i))
  return list
}
