import express from "express"
import { join } from "path"
import * as Routes from "./routes"

export default () => {
  const svr = express()
  svr.use("/assets", express.static(join(__dirname, "public/assets")))

  svr.use("/", Routes.pages)
  svr.use("/", Routes.oath)
  svr.use("/api", Routes.api)

  return svr
}

