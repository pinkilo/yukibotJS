import { Credentials } from "google-auth-library"
import { youtube_v3 } from "googleapis"
import Schema$Subscription = youtube_v3.Schema$Subscription
import Schema$LiveChatMessage = youtube_v3.Schema$LiveChatMessage
import Schema$LiveBroadcast = youtube_v3.Schema$LiveBroadcast

export enum EventType {
  AUTH,
  SUBSCRIPTION,
  MESSAGE_BATCH,
  BROADCAST_UPDATE,
}

export interface Event {
  type: EventType
}

export class AuthEvent implements Event {
  readonly type = EventType.AUTH
  readonly credentials: Credentials

  constructor(credentials: Credentials) {
    this.credentials = credentials
  }
}

export class SubscriptionEvent implements Event {
  readonly type = EventType.SUBSCRIPTION
  readonly subscription: Schema$Subscription

  constructor(subscription: Schema$Subscription) {
    this.subscription = subscription
  }
}

export class MessageBatchEvent implements Event {
  readonly type = EventType.MESSAGE_BATCH
  readonly incoming: Schema$LiveChatMessage[]

  constructor(incoming: Schema$LiveChatMessage[]) {
    this.incoming = incoming
  }
}

export class BroadcastUpdateEvent implements Event {
  readonly type = EventType.BROADCAST_UPDATE
  readonly broadcast: Schema$LiveBroadcast

  constructor(broadcast: Schema$LiveBroadcast) {
    this.broadcast = broadcast
  }
}
