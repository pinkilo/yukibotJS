import { google } from "googleapis"

export const basePollingRate = 14.4 * 1000

const client = google.youtube("v3")

export default client
