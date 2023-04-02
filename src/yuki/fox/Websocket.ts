import { WebSocket, WebSocketServer } from "ws"
import logger from "winston"

export type Animations = "idle" | "greet" | "attack" | "dance" | "eat"

let socket: WebSocket
export const setAnimation = (anim: Animations, text?: string) => {
  if (socket) {
    logger.info(`set animation ${ anim }`)
    socket.send(JSON.stringify({ anim, text }))
  } else {
    logger.error("socket not connected")
  }
}

export const setSocket = (server: WebSocketServer) => {
  server.on("connection", (ws) => {
    logger.info("websocket connected")
    socket = ws
  })
}

