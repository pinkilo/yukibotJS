// noinspection DuplicatedCode

window.addEventListener("fox_ready", () => nextAnim())
const speechBubble = document.getElementById("speech_span")
const speechSpan = document.getElementById("speech_bubble")

/** @type {Array<() => void>} */
const animQueue = []
let idling = true

const ws = new WebSocket("ws://localhost:3000/fox")

ws.addEventListener("open", () => {
  console.log("websocket connected")
  speechBubble.hidden = true
  enqueueAnim(() => speak("Connected!"))
})

ws.addEventListener("message", (event) => {
  console.log(event.data, animQueue)
  /** @type {{text: string, anim: "idle" | "greet" | "attack" | "dance" | "eat"}} */
  const packet = JSON.parse(event.data)
  switch (packet.anim) {
    case "idle":
      enqueueAnim(idle)
      break
    case "attack":
      enqueueAnim(attack)
      break
    case "dance":
      enqueueAnim(dance)
      break
    case "eat":
      enqueueAnim(eat)
      break
    case "greet":
      enqueueAnim(() => speak(packet.text))
      break
  }
})

function enqueueAnim(f) {
  if (idling && ready) {
    if (f !== idle) idling = false
    f()
  } else animQueue.push(f)
}

function display(anim) {
  currentAnimation.reset()
  currentAnimation = anim
}

/**
 *
 * @param {string} text
 * @param {number} duration duration in seconds
 */
function displaySpeech(text, duration) {
  speechSpan.innerText = text
  speechBubble.hidden = false
  setTimeout(() => (speechBubble.hidden = true), duration * 1000)
}

/**
 *
 * @param {number} delay delay in seconds
 */
function nextAnim(delay = 0) {
  const next = animQueue.shift() || idle
  setTimeout(() => {
    if (next !== idle) idling = false
    next()
  }, delay * 1000)
}

function idle() {
  idling = true
  display(animations.idle)
}

function attack() {
  display(animations.attack)
  const duration = 3
  displaySpeech("YOU DARE?", duration)
  nextAnim(duration)
}

function speak(text) {
  display(animations.greet)
  const duration = 2.4
  displaySpeech(text, duration)
  nextAnim(duration)
}

function dance() {
  display(animations.dance)
  nextAnim(4.8)
}

function eat() {
  display(animations.eat)
  const duration = 8.5
  displaySpeech("YES FOOD", duration)
  nextAnim(duration)
}
