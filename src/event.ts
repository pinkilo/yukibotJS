import { Credentials } from "google-auth-library"
import { ChatMessage, Subscription } from "./types/google"
import { Alert } from "./yuki"

export enum EventName {
  AUTH,
  SUBSCRIBER,
  MESSAGE_BATCH,
  WEBSOCKET_CONNECT,
  BANK_LOAD,
  BANK_UPDATE,
  ALERT,
}

type Event = { name: EventName }

export class AuthEvent implements Event {
  readonly name = EventName.AUTH
  readonly credentials: Credentials

  constructor(credentials: Credentials) {
    this.credentials = credentials
  }
}

export class SubscriberEvent implements Event {
  readonly name = EventName.SUBSCRIBER
  readonly subscription: Subscription

  constructor(subscription: Subscription) {
    this.subscription = subscription
  }
}

export class MessageBatchEvent implements Event {
  readonly name = EventName.MESSAGE_BATCH
  readonly incoming: ChatMessage[]
  readonly all: ChatMessage[]

  constructor(incoming: ChatMessage[], all: ChatMessage[]) {
    this.incoming = incoming
    this.all = all
  }
}

export class WebsocketConnectEvent implements Event {
  readonly name = EventName.WEBSOCKET_CONNECT
}

export class BankLoadEvent implements Event {
  readonly name = EventName.BANK_LOAD
}

export class BankUpdateEvent implements Event {
  readonly name = EventName.BANK_UPDATE
}

export class AlertEvent implements Event {
  readonly name = EventName.ALERT
  readonly alert: Alert

  constructor(alert: Alert) {
    this.alert = alert
  }
}

const eventListeners: Map<EventName, Function[]> = new Map()

/** Adds an event listener for the given event type */
export const listen = <E extends Event>(
  eventName: EventName,
  listener: (event: E) => Promise<any>
) => {
  if (!eventListeners[eventName]) eventListeners[eventName] = []
  eventListeners[eventName].push(listener)
}

export const announce = (event: Event) =>
  eventListeners[event.name]?.forEach((f) => f(event))

export default Event
