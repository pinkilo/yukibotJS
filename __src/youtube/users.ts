import { User } from "../models"
import { AsyncCache } from "../Cache"
import { randFromRange } from "../util"
import ytApi from "./apiClient"
import auth from "./auth"

const userCache = new AsyncCache<User>(async (k) => (await fetchUsers([k]))[0])

const getRandomUser = (exclude: string[] = []): User => {
  const users = userCache.values().filter((u) => !exclude.includes(u.id))
  return users[randFromRange(0, users.length)]
}

const fetchUsers = async (uid: string[]): Promise<User[]> => {
  const result = await ytApi.channels.list({
    id: uid,
    part: ["snippet"],
    auth,
  })
  return result.data.items?.map((c) => User.fromChannel(c)) || []
}

export { userCache, getRandomUser, fetchUsers }
