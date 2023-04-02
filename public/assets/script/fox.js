// noinspection DuplicatedCode


const ws = new WebSocket("ws://localhost:3000/fox")

ws.addEventListener("open", () => initialize())

ws.addEventListener("message", event => {
  /**
   * @type {{text: string, anim: "idle" | "greet" | "attack" | "dance" | "eat"}}
   */
  const packet = JSON.parse(event.data)
  console.log(packet)
  switch (packet.anim) {
    case "idle":
      idle()
      break;
    case "greet":
      greet(packet.text)
      break;
    case "attack":
      attack()
      break;
    case "dance":
      dance()
      break;
    case "eat":
      eat()
      break;
  }
})

const div = document.getElementById("fox_house")
const fox = document.getElementById("fox")
const speechBubble = document.getElementById("speech_bubble")
let idleTimeout

/**
 * @param {"idle" | "greet" | "attack" | "dance" | "eat"} anim
 */
function display(anim) {
  fox.setAttribute("src", `assets/images/fox/fox_orange_${anim}.gif`)
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

function initialize() {
  console.log("fox connected")
  speechBubble.hidden = true
  display("idle")
}

/**
 *
 * @param {number} delay timeout delay in seconds
 */
function idleReset(delay = 2.4) {
  idleTimeout = setTimeout(() => display("idle"), delay * 1000)
}

function idle() {
  display("idle")
}

function attack() {
  display("attack")
  idleReset(3)
}

function greet(name) {
  display("greet")
  const duration = 2.4
  // TODO add more greetings
  displaySpeech(`Hello ${name}!`, duration)
  idleReset(duration)
}

function dance() {
  display("dance")
  idleReset(4.8)
  // TODO
}

function eat() {
  display("eat")
  idleReset(8.3)
}
