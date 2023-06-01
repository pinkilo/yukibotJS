import { youtube_v3 } from "googleapis"
import Schema$LiveChatMessage = youtube_v3.Schema$LiveChatMessage
import Schema$Subscription = youtube_v3.Schema$Subscription

export const createMessage = (
  text: string,
  publishedAt: string = new Date().toISOString()
): Schema$LiveChatMessage => ({
  kind: "youtube#liveChatMessage",
  id: "123",
  snippet: {
    type: "textMessageEvent",
    liveChatId: "ABC123",
    authorChannelId: "CHANNEL_ID",
    publishedAt,
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

export const createSubscription = (
  publishedAt: string = new Date().toISOString()
): Schema$Subscription => ({
  kind: "youtube#subscription",
  etag: "ENTITY_TAG",
  id: "SUBSCRIPTION_ID",
  snippet: {
    publishedAt,
    channelTitle: "OWN_CHANNEL_TITLE",
    title: "SUBSCRIPTION_TITLE",
    description: "DETAILS",
    resourceId: {
      kind: "youtube#subscription",
      channelId: "OWN_CHANNEL_ID",
    },
    channelId: "OWN_CHANNEL_ID",
    thumbnails: {
      default: {
        url: "",
        width: 0,
        height: 0,
      },
      medium: {
        url: "",
        width: 0,
        height: 0,
      },
      high: {
        url: "",
        width: 0,
        height: 0,
      },
    },
  },
  subscriberSnippet: {
    title: "CHANNEL_TITLE",
    description: "CHANNEL_DESCRIPTION",
    channelId: "CHANNEL_ID",
    thumbnails: {
      default: {
        url: "",
      },
      medium: {
        url: "",
      },
      high: {
        url: "",
      },
    },
  },
})
