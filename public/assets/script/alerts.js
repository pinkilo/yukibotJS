const alertBox = document.getElementById("alert_box")

let running = false
const pollingRate = 5 * 1000

getAlert()

/**
 *
 * @param {{
 *   message: string,
 *   image?: string,
 *   durationSec: number,
 *   redeemer: { name: string, id: string }
 * }} alert
 */
function draw(alert) {
  console.log("Drawing Alert")
  alertBox.innerText = alert.message
}

async function getAlert() {
  console.log("fetching alerts")
  const resp = await fetch("/api/alerts")
  /**
   *
   * @type {{alert: {
   *   message: string,
   *   image?: string,
   *   durationSec: number,
   *   redeemer: { name: string, id: string }
   * }}}
   */
  const packet = await resp.json()
  if (packet.alert) draw(packet.alert)
  setTimeout(() => getAlert(), packet.alert.durationSec)
}
