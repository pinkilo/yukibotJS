// noinspection DuplicatedCode


const ws = new WebSocket("ws://localhost:3000/fox")

ws.addEventListener("open", () => initialize())

ws.addEventListener("message", event => {
  const packet = JSON.parse(event.data)
  console.log(packet)
  switch (packet.anim) {
    case "GREET":
      greet(packet.text)
      break;
  }
})

const div = document.getElementById("fox_house")
const fox = document.getElementById("fox")
const speechBubble = document.getElementById("speech_bubble")

/**
 * @param {"idle" | "greet" | "attack" | "dance" | "eat"} anim
 */
function display(anim) {
  fox.setAttribute("src", `assets/images/fox/fox_orange_${anim}.gif`)
}

function displaySpeech(text, duration) {
  speechBubble.hidden = false
  speechBubble.innerText = text
  setTimeout(() => speechBubble.hidden = true, duration)
}

function initialize() {
  console.log("fox connected")
  speechBubble.hidden = true
  display("idle")
}


function greet(name) {
  console.log(`Greeting ${name}`)
  display("greet")
  const duration = 2400 * 1.5
  // TODO add more greetings
  displaySpeech(`Hello ${name}!`, duration)
  setTimeout(() => display("idle"), duration)
}
