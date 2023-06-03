export const cIntervalOf = (delay: number, callback: () => Promise<void>) =>
  new ConditionalInterval(delay, callback)

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

  async run(): Promise<void> {
    if (this.running === true) return
    this.running = true
    await this.looper()
  }

  stop(): void {
    this.running = false
  }
}
