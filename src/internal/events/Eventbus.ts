import Event, { EventType } from "./Event"

export default class Eventbus {
  private readonly listeners: Map<EventType, ((event: Event) => unknown)[]> =
    new Map()

  listen<E extends Event>(
    type: EventType,
    listener: (event: E) => Promise<unknown>
  ) {
    if (!this.listeners.has(type)) this.listeners.set(type, [])
    this.listeners.get(type).push(listener)
  }

  announce(event: Event) {
    this.listeners.get(event.type)?.forEach((listener) => listener(event))
  }

  clear() {
    this.listeners.clear()
  }
}
