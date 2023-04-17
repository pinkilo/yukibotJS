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

export type AuthEvent = Event & {
  name: EventName.AUTH
  credentials: Credentials
}

export type SubscriberEvent = Event & {
  name: EventName.SUBSCRIBER
  subscription: Subscription
}

export type MessageBatchEvent = Event & {
  name: EventName.MESSAGE_BATCH
  incoming: ChatMessage[]
  all: ChatMessage[]
}

export type WebsocketConnectEvent = Event & {
  name: EventName.WEBSOCKET_CONNECT
}

export type BankLoadEvent = Event & { name: EventName.BANK_LOAD }

export type BankUpdateEvent = Event & { name: EventName.BANK_UPDATE }

export type AlertEvent = Event & { name: EventName.ALERT; alert: Alert }

const eventListeners: Map<EventName, Function[]> = new Map()

/** Adds an event listener for the given event type */
export const listen = <E extends Event>(
  eventName: EventName,
  listener: (event: E) => Promise<any>
) => {
  if (!eventListeners[eventName]) eventListeners[eventName] = []
  eventListeners[eventName].push(listener)
}

export const announce = <E extends Event>(event: E) =>
  eventListeners[event.name]?.forEach((f) => f(event))

export default Event
