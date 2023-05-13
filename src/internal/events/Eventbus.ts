import { Event, EventType } from "./Event"
import { attempt } from "../util"

type ListenerFun<E extends Event> = (
  event: E,
  self: Listener<E>
) => Promise<unknown>

class Listener<E extends Event> {
  private readonly parent: Eventbus
  private readonly type: EventType
  readonly invoke: ListenerFun<E>

  constructor(parent: Eventbus, type: EventType, invoke: ListenerFun<E>) {
    this.parent = parent
    this.type = type
    this.invoke = invoke
  }

  /**
   * Remove this event listener from the eventbus
   *
   * @returns true if successfully removed
   */
  remove(): boolean {
    return this.parent.remove(this.type, this)
  }
}

export default class Eventbus {
  private readonly listeners: Map<EventType, Set<Listener<Event>>> = new Map()

  listen<E extends Event>(type: EventType, listener: ListenerFun<E>) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set())
    this.listeners.get(type).add(new Listener<Event>(this, type, listener))
  }

  async announce(event: Event) {
    const listeners = this.listeners.get(event.type)
    if (!listeners) return
    await Promise.all(
      Array.from(listeners.values()).map((l) =>
        attempt(
          () => l.invoke(event, l),
          "an err occurred in an event listener"
        )
      )
    )
  }

  get size(): number {
    return this.listeners.size
  }

  /** @returns the number of listeners for the given [type] */
  listenerCount(type?: EventType): number {
    if (type) return this.listeners.get(type)?.size || 0
    return Array.from(this.listeners.values())
      .map((set) => set.size)
      .reduce((sum, size) => sum + size)
  }

  remove(type: EventType, listener: Listener<Event>): boolean {
    return this.listeners.get(type)?.delete(listener) ?? false
  }
}
