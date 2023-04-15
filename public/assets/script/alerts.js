const ui = {
  alertbox: document.querySelector("#alert_box"),
  alertTypeText: document.querySelector("#alert_box header span"),
  userText: document.querySelector("#alert_box section h1"),
}

let running = false
const pollingRate = 5 * 1000
const baseDelay = 2 * 1000

getAlert()

/**
 *
 * @param {{
 *   description: string,
 *   image?: string,
 *   durationSec: number,
 *   redeemer: { name: string, id: string }
 * }} alert
 */
function draw(alert) {
  console.log("Drawing Alert", alert)
  ui.alertbox.style.display = "grid"
  ui.alertTypeText.innerText = alert.description
  ui.userText.innerText = alert.redeemer.name
}

function clear() {
  ui.alertTypeText.innerText = ""
  ui.alertbox.style.display = "none"
}

async function getAlert() {
  console.log("fetching alerts")
  const resp = await fetch("/api/alerts")
  /**
   *
   * @type {{alert: {
   *   description: string,
   *   image?: string,
   *   durationSec: number,
   *   redeemer: { name: string, id: string }
   * }}}
   */
  const packet = await resp.json()
  let delay
  if (packet.alert) {
    delay = packet.alert.durationSec * 1000
    draw(packet.alert)
  } else {
    delay = pollingRate
  }
  setTimeout(() => {
    clear()
    setTimeout(() => getAlert(), baseDelay)
  }, delay)
}
