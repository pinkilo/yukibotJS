# Yukibot: Youtube Live Bot Framework

[![CD](https://github.com/pinkilo/yukibotJS/actions/workflows/publish-ci.yml/badge.svg)](https://github.com/pinkilo/yukibotJS/actions/workflows/publish-ci.yml)

---

Yukibot is a YouTube livestream bot framework inspired by 
[Strife's](https://gitlab.com/serebit/strife) DSL-style
and allows extensibility for custom requirements.


<!-- TOC -->
* [Yukibot: Youtube Live Bot Framework](#yukibot-youtube-live-bot-framework)
  * [Installing](#installing)
  * [Usage](#usage)
    * [Basic Usage](#basic-usage)
    * [More Features](#more-features)
  * [Contributing](#contributing)
<!-- TOC -->


## Installing

```
yarn add @pinkilo/yukibot
```
```
npm install @pinkilo/yukibot
```

## Usage

### Basic Usage

```ts
import yuki from "yukibot"
import { config } from "dotenv" 

config() // load your googleAPI secrets

async function main() {
  // create a bot instance with the `yuki` dsl
  const bot = await yuki((y) => {
    y.logLevel = "http" // info, debug, error, none, etc
    y.yukiConfig.name = "MyBot" // set how the bot refers to itself
    y.yukiConfig.prefix = /^>$/ // set the command prefix e.g. `>myCommand`
    y.googleConfig = {
      clientId: process.env.G_CLIENT_ID,
      clientSecret: process.env.G_CLIENT_SECRET,
      redirectUri: process.env.G_REDIRECT_URI,
    }
    y.tokenLoader = async () => ({
      // provide a way to load auth tokens, e.g., from file or a database
    })

    // Add a message listener which greets the first chatter then removes itself
    y.onMessage(({ authorDetails: { displayName } }) => {
      y.sendMessage(`Hello there, ${displayName}!`)
    })

    // build a command which responds to `>greet` with "Hello There"
    y.command((cmd) => {
      cmd.name = "greet"
      cmd.rateLimit.individual = 10 // set the per-user cooldown to 10 seconds
      cmd.invoke = async () => {
        await y.sendMessage("Hello There")
      }
    })
  })

  // use the bot's express app to login with OAuth
  // the express app can be used however you like, as long as you don't overwrite
  // `/`, `/auth` or `/callback`
  bot.express.listen(3000, () => console.log(`http://localhost:${3000}`))
  // Add a listener that restarts the bot on login
  bot.onAuthUpdate(() => bot.start())
}
```

### More Features

```ts
/**
 * You can extract the setup to one or more functions to sort your code!
 *
 * @param {YukiBuilder} builder
 */
async function extractedSetup(builder: YukiBuilder) {
  // add a message listener which removes itself if the message says "get out"
  builder.onMessage(
    ({ snippet: { displayMessage } }) => {
      return displayMessage.match(/^get\s+out$/)
    },
    async (_, match) => match !== null
  )

  // add a passive, which acts like a message listener with a predicate
  builder.passive(
    async (msg, tokens, self) => {
      /* if this returns TRUE then the execution logic will run */
      return true
    },
    async (msg, tokens, self) => {
      /* execution logic: only runs if the predicate returns true */
    }
  )

  // add a memoryPassive which is a normal passive
  // with a convenient property for storing data
  builder.memoryPassive<number>(
    0 /* initial state of memory */, 
    async () => true /* predicate */,
    async (_,__, { memory }) => {
      memory += 1
      console.log(`Messages received: ${memory}`)
    })
}
```

## Contributing

Contributing is highly encouraged. It's best to make an issue first to discuss
what you want to add, but we won't stop you from making something cool!

Commits should be written with (plus our own tags)
[eslint standards](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-eslint).

* `Fix` - for a bug fix.
* `Update` - either for a backwards-compatible enhancement or for a rule change that adds reported problems.
* `New` - implemented a new feature.
* `Breaking` - for a backwards-incompatible enhancement or feature.
* `Docs` - changes to documentation only.
* `Build` - changes to build process only.
* `Upgrade` - for a dependency upgrade.
* `Chore` - for refactoring, adding tests, etc. (anything that isn't user-facing).
* `Refactor` - same as chore but for the context of non-breaking refactors
* `Tests` - same as chore but for the context of adding or modifying tests
