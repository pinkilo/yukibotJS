import { google } from "googleapis"

export const basePollingRate = 14.4 * 1000

export default google.youtube("v3")
