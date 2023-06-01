export default class ConditionalInterval {
  private readonly looper: () => Promise<void>
  private running = false

  constructor(delay: number, callback: () => Promise<void>) {
    this.looper = async () => {
      if (!this.running) return
      await callback()
      setTimeout(this.looper, delay)
    }
  }

  run() {
    this.running = true
    return this.looper()
  }

  stop() {
    this.running = false
  }
}
