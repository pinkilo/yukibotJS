import { Result } from "../../internal"

export type GoogleConfig = {
  clientId: string
  clientSecret: string
  redirectUri: string
}

export type YukiConfig = {
  /** self-referential name. defaults to `yuki` */
  name: string
  /** chat polling rate in seconds. defaults to 14.4 */
  chatPollRate: number
  /** broadcast polling rate in seconds. defaults to 120 */
  broadcastPollRate: number
  /** recent subscriptions polling rate in seconds. defaults to 60 */
  subscriptionPollRate: number
  /** command prefix. defaults to `/^([>!]|y!)/` i.e. `>`,`!`, or `y!` */
  prefix: RegExp
  /** running in test-mode */
  test?: boolean
}

export type RouteConfig = {
  [name: string | symbol]: `${"/"}${string | number}`
}

export type Loader<T> = () => Promise<Result<T>>
