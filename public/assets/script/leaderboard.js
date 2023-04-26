const ul = document.getElementById("leaderboard")
const pollRate = 10 * 1000

getBoard()
  .catch(e => console.error(e))

function draw(list) {
  console.log("drawing leaderboard")
  ul.innerHTML = ""
  list.slice(0, 10).forEach(([k, v], i) => {
    const li = document.createElement("li")
    const rank = document.createElement("span")
    const name = document.createElement("span")
    const wallet = document.createElement("span")
    rank.innerText = `${i + 1}:`
    name.innerText = k
    wallet.innerText = v.toLocaleString()
    li.append(rank, name, wallet)
    ul.append(li)
  })
}

async function getBoard() {
  document.body.hidden = true
  console.log("fetching leaderboard")
  const resp = await fetch("/api/leaderboard")
  /** @type {{ payload: [name: string, wallet: number][] }} */
  const packet = await resp.json()
  console.log(packet)
  const duration = await getDisplayDuration()
  if (duration > 0) {
    document.body.hidden = false
    draw(packet.payload)
    setTimeout(() => getBoard(), duration * 1000)
  }
  else setTimeout(() => getBoard(), pollRate)
}

/**
 *
 * @returns {Promise<number>} duration in seconds
 */
async function getDisplayDuration() {
  console.log("fetching display duration")
  const resp = await fetch("/api/leaderboard/duration")
  /** @type {{ payload: number }} */
  const packet = await resp.json()
  return packet.payload
}
