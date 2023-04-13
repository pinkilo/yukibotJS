import { youtube_v3 } from "googleapis"
import Schema$LiveChatMessageAuthorDetails = youtube_v3.Schema$LiveChatMessageAuthorDetails
import Schema$Channel = youtube_v3.Schema$Channel

export default class User {
  id: string
  name: string
  url?: string
  moderator: boolean
  owner: boolean
  sponsor: boolean
  profileUrl?: string

  static fromAuthor(ad: Schema$LiveChatMessageAuthorDetails) {
    return new User(
      ad.channelId,
      ad.displayName,
      ad.channelUrl,
      ad.isChatModerator,
      ad.isChatOwner,
      ad.isChatSponsor,
      ad.profileImageUrl,
    )
  }

  static fromChannel(ch: Schema$Channel) {
    return new User(
      ch.id,
      ch.snippet.title,
      ch.snippet.customUrl,
    )
  }

  constructor(
    id: string,
    name: string,
    url?: string,
    moderator: boolean = false,
    owner: boolean = false,
    sponsor: boolean = false,
    profileUrl?: string,
  ) {
    this.id = id
    this.name = name
    this.url = url
    this.moderator = moderator
    this.owner = owner
    this.sponsor = sponsor
    this.profileUrl = profileUrl
  }

  update(ad: Schema$LiveChatMessageAuthorDetails) {
    this.id = ad.channelId
    this.name = ad.displayName
    this.url = ad.channelUrl
    this.moderator = ad.isChatModerator
    this.owner = ad.isChatOwner
    this.sponsor = ad.isChatSponsor
    this.profileUrl = ad.profileImageUrl
  }

  updateFromChannel(ch: Schema$Channel) {
    this.id = ch.id
    this.name = ch.snippet.title
  }

}
