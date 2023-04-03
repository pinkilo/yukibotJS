// noinspection DuplicatedCode
// TODO Animations should be added to a queue so they are not cancelled

window.addEventListener("fox_ready", () => nextAnim())
const speechBubble = document.getElementById("speech_bubble")

/** @type {Array<() => void>} */
const animQueue = []
let idling = true

const ws = new WebSocket("ws://localhost:3000/fox")

ws.addEventListener("open", () => {
  console.log("websocket connected")
  speechBubble.hidden = true
  enqueueAnim(() => greet("Connected!"))
})

ws.addEventListener("message", event => {
  console.log(event.data, animQueue)
  /** @type {{text: string, anim: "idle" | "greet" | "attack" | "dance" | "eat"}} */
  const packet = JSON.parse(event.data)
  switch (packet.anim) {
    case "idle":
      enqueueAnim(idle)
      break;
    case "attack":
      enqueueAnim(attack)
      break;
    case "dance":
      enqueueAnim(dance)
      break;
    case "eat":
      enqueueAnim(eat)
      break;
    case "greet":
      enqueueAnim(() => greet(packet.text))
      break;
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
  speechBubble.hidden = false
  speechBubble.innerText = text
  setTimeout(() => speechBubble.hidden = true, duration * 1000)
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
  nextAnim(3)
}

function greet(name) {
  display(animations.greet)
  const duration = 2.4
  // TODO add more greetings
  displaySpeech(`Hello ${name}!`, duration)
  nextAnim(duration)
}

function dance() {
  display(animations.dance)
  nextAnim(4.8)
}

function eat() {
  display(animations.eat)
  nextAnim(8.5)
}



