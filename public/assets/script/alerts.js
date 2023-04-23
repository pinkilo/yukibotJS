const ui = {
  alertbox: document.querySelector("#alert_box"),
  alertTypeText: document.querySelector("#alert_box header span"),
  userText: document.querySelector("#alert_box section h1"),
}

/** @type {Howl} */
let sound
const pollingRate = 5 * 1000
const baseDelay = 2 * 1000

getAlert()

/**
 *
 * @param {{
 *   description: string,
 *   sound?: string,
 *   durationSec: number,
 *   redeemer: { name: string, id: string }
 * }} alert
 */
function draw(alert) {
  console.log("Drawing Alert", alert)
  ui.alertTypeText.innerText = alert.description
  ui.userText.innerText = alert.redeemer.name
  ui.alertbox.style.display = "grid"
  if (alert.sound) play(alert.sound)
}

function clear() {
  ui.alertTypeText.innerText = ""
  ui.alertbox.style.display = "none"
  if (sound) sound.stop()
}

/**
 *
 * @param {string} soundFile
 */
function play(soundFile) {
  sound = new Howl({ src: [soundFile], volume: 0.5, format: "mp3" })
  sound.play()
}

async function getAlert() {
  console.log("fetching alerts")
  const resp = await fetch("/api/alerts")
  /**
   *
   * @type {{payload: {
   *   description: string,
   *   durationSec: number,
   *   redeemer: { name: string, id: string },
   *   sound?: string
   * }}}
   */
  const packet = await resp.json()
  let delay
  if (packet.payload) {
    delay = packet.payload.durationSec * 1000
    draw(packet.payload)
  } else {
    delay = pollingRate
  }
  setTimeout(() => {
    clear()
    setTimeout(() => getAlert(), baseDelay)
  }, delay)
}
