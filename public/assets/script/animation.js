const canvas = document.getElementById("fox_canvas")
const ctx = canvas.getContext("2d")
let ready = false

const frameRate = 10
let lastRenderTime;
let currentAnimation;
/***/
const animations = {
  idle: undefined,
  greet: undefined,
  attack: undefined,
  eat: undefined,
  dance: undefined,
}

window.addEventListener("load", () => main())

async function main() {
  animations.idle = await loadAnimation("idle")
  animations.greet = await loadAnimation("greet")
  animations.attack = await loadAnimation("attack")
  animations.eat = await loadAnimation("eat")
  animations.dance = await loadAnimation("dance")
  currentAnimation = animations.idle
  console.log("starting engine")
  ready = true
  window.dispatchEvent(new Event("fox_ready"))
  window.requestAnimationFrame(engine)
}

function engine(time) {
  // Await for window ready to render
  window.requestAnimationFrame(engine);

  /** Seconds since last render */
  const renderDelay = (time - lastRenderTime) / 1000;

  // Ignore renders that are too fast
  if (renderDelay < (1 / frameRate)) return;

  // Update last render time to time param
  lastRenderTime = time;

  draw();
}

function draw() {
  ctx.clearRect(0, 0, 300, 300)
  const frame = currentAnimation.nextFrame()
  ctx.drawImage(
    currentAnimation.image,
    frame.frame.x,
    frame.frame.y,
    frame.frame.w,
    frame.frame.h,
    frame.spriteSourceSize.x,
    frame.spriteSourceSize.y,
    frame.spriteSourceSize.w,
    frame.spriteSourceSize.h,
  )
}

async function loadAnimation(name) {
  const resp = await fetch(`../assets/sprites/fox_orange_${name}.json`)
  const atlas = await resp.json()
  const img = new Image()
  img.src = `assets/sprites/fox_orange_${name}.png`
  const anim = new Animation(img, atlas.frames)
  img.addEventListener("load", () => anim.ready = true)
  return anim
}


class Animation {
  ready
  /** @type {HTMLImageElement} */
  image
  /**
   * @type {{
   *   filename: string,
   *   frame: {
   *     x: number,
   *     y: number,
   *     w: number,
   *     h: number
   *   },
   *   rotated: boolean,
   *   trimmed: boolean,
   *   spriteSourceSize: {
   *     x: number,
   *     y: number,
   *     w: number,
   *     h: number
   *   },
   *   sourceSize: {
   *     w: number,
   *     h: number
   *   }
   * }[]}
   */
  frames
  currentFrame = 0

  constructor(spriteSheet, frames) {
    this.image = spriteSheet
    this.frames = frames
  }

  nextFrame() {
    const f = this.currentFrame++
    if (this.currentFrame >= this.frames.length) this.currentFrame = 0
    return this.frames[f]
  }

  reset() {
    this.currentFrame = 0
  }
}
