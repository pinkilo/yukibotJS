import { WebSocket, WebSocketServer } from "ws"
import logger from "winston"

export type Animations = "idle" | "greet" | "attack" | "dance" | "eat"

let socket: WebSocket
export const setAnimation = (anim: Animations, text?: string) => {
  socket.send(JSON.stringify({ anim, text }))
}

export const setSocket = (server: WebSocketServer) => {
  server.on("connection", (ws) => {
    logger.info("websocket connected")
    socket = ws
  })
}

