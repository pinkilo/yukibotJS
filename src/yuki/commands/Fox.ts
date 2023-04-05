import Command from "./Command"
import { setAnimation } from "../fox"

const attack = new Command(
  "attack", [], 5, 120, 20,
  async (msg) => {
    setAnimation("attack", msg.authorDetails.displayName)
  })

const feed = new Command(
  "feed", [], 5, 180, 30,
  async ({authorDetails: {channelId}}) => {
    setAnimation("eat")
    return {
      uids: [channelId],
      amount: Math.random() * 50
    }
  })

const dance = new Command(
  "dance", [], 5, 60, 20,
  async ({authorDetails: {channelId}}) => {
    setAnimation("dance")
    return {
      uids: [channelId],
      amount: Math.random() * 10
    }
  })

export default { attack, feed, dance }
