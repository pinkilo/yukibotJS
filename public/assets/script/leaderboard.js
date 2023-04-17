const ul = document.getElementById("leaderboard")
getBoard()

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
  console.log("fetching leaderboard")
  const resp = await fetch("/api/leaderboard")
  /** @type {{ payload: [name: string, wallet: number][] }} */
  const packet = await resp.json()
  console.log(packet)
  draw(packet.payload)
  setTimeout(() => getBoard(), 20 * 1000)
}
