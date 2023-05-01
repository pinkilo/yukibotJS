import { SyncCache, userCache } from "../Cache"
import ENV from "../env"

const startingWallet = 100
const name = "rupee"
const walletCache = new SyncCache<number>(() => startingWallet)

/** Modify all given wallets by uid. Use negative numbers to remove money */
const transactionBatch = async (batch: [string, number][]) => {
  batch.forEach(([uid, amount]) =>
    walletCache.put(uid, walletCache.get(uid) + amount)
  )
  await walletCache.save(ENV.FILE.CACHE.BANK)
}

/** @returns sorted list of wallets (larges -> smallest) */
const getLeaderboard = async (
  hydrate: boolean = false
): Promise<[string, number][]> => {
  const lbroot = walletCache.entries().sort(([_, a], [__, b]) => b - a)
  const lb = lbroot.filter(([key]) => key !== ENV.SELF.ID)
  if (hydrate) {
    const users = await Promise.all(lb.map(([uid]) => userCache.get(uid)))
    return lb.map(([lbId, val]) => {
      return [users.find((u) => u.id === lbId)?.name || "unknown", val]
    })
  }
  return lb
}

export default { name, transactionBatch, getLeaderboard, walletCache }
