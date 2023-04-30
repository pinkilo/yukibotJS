import * as process from "process"
import { config } from "dotenv"

config()

export default {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  FILE: {
    CACHE: {
      USER: "./.cache/user.json",
      BANK: "./.cache/bank.json",
    },
    ALERTS: "./.cache/alert_history.json",
    SUBSCRIBER: "./.cache/lastsub.json",
  },
  SELF: {
    ID: "UCC5woRixgHKy-3iOOVSKwZA",
    NAME: "Numberless Liquidators",
  },
  GOOGLE: {
    G_PROJECT_ID: process.env.G_PROJECT_ID,
    G_CLIENT_ID: process.env.G_CLIENT_ID,
    G_AUTH_URI: process.env.G_AUTH_URI,
    G_TOKEN_URI: process.env.G_TOKEN_URI,
    G_AUTH_PROVIDER_CERT_URL: process.env.G_AUTH_PROVIDER_CERT_URL,
    G_CLIENT_SECRET: process.env.G_CLIENT_SECRET,
    G_REDIRECT_URI: process.env.G_REDIRECT_URI,
  },
}
