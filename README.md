# Yukibot: YouTube Live Bot Framework

[![CD](https://github.com/pinkilo/yukibotJS/actions/workflows/publish-ci.yml/badge.svg)](https://github.com/pinkilo/yukibotJS/actions/workflows/publish-ci.yml)

---

Yukibot is a YouTube livestream bot framework inspired by
[Strife's](https://gitlab.com/serebit/strife) DSL-style
and allows extensibility for custom requirements.

<!-- TOC -->
* [Yukibot: YouTube Live Bot Framework](#yukibot-youtube-live-bot-framework)
  * [Installing](#installing)
  * [Usage](#usage)
    * [A Basic Complete Example](#a-basic-complete-example)
    * [Setup and Configuration](#setup-and-configuration)
    * [Commands & Passives](#commands--passives)
    * [Extending Yukibot](#extending-yukibot)
      * [Custom Routes](#custom-routes)
  * [Testing](#testing)
    * [Live Testing](#live-testing)
    * [Programmatic Testing](#programmatic-testing)
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

### A Basic Complete Example

```ts
import yuki from "yukibot"

async function main() {
  // create a bot instance with the `yuki` dsl
  const bot = await yuki((y) => {
    // set how the bot refers to itself
    y.yukiConfig.name = "MyBot"
    // set your google API secrets
    y.googleConfig = {
      clientId: process.env.G_CLIENT_ID,
      clientSecret: process.env.G_CLIENT_SECRET,
      redirectUri: process.env.G_REDIRECT_URI,
    }
    y.tokenLoader = async () => ({
      // provide a way to load auth tokens
      // e.g., from file or a database
    })

    // Add a message listener which greets a chatter
    y.onMessage(({ authorDetails: { displayName } }) => {
      y.sendMessage(`Hello there, ${displayName}!`)
    })
  })

  // use the bot's express app to login with OAuth
  bot.express.listen(3000, () => console.log(`http://localhost:${3000}`))
  // Add a listener that restarts the bot on login
  bot.onAuthUpdate(() => bot.restart())
}
```

### Setup and Configuration

```ts
await yuki((y) => {
  // set the bot's logging level
  // useful values: error, info, debug, http, none
  y.logLevel = "info"
  // set how the bot refers to itself
  y.yukiConfig.name = "MyBot"
  // set the command prefix e.g. `>myCommand`
  y.yukiConfig.prefix = /^>/
  // run the bot in test mode
  y.yukiConfig.test = false
  /*
    you can adjust the API polling rates in the
    yukiConfig as well (values should be in seconds):
    
    y.yukiConfig.chatPollRate
    y.yukiConfig.broadcastPollRate
    y.yukiConfig.subscriptionPollRate
   */

  // set your google API secrets
  y.googleConfig = {
    clientId: process.env.G_CLIENT_ID,
    clientSecret: process.env.G_CLIENT_SECRET,
    redirectUri: process.env.G_REDIRECT_URI,
  }

  /*
   provide a way to load auth tokens
   e.g., from file or a database
   !NOTE! the bot will still run if this returns undefined,
          but you will have to login on each startup 
  */
  y.tokenLoader = async () => ({})

  // use this to load users saved to file or a DB (optional)
  y.userCacheLoader = async () => ({})
})
```

### Commands & Passives

```ts
await yuki(async (y) => {
  // add a command which responds to `>greet` with "Hello There"
  y.command((cmd) => {
    cmd.name = "greet"
    cmd.rateLimit.individual = 60
    cmd.invoke = async () => {
      await y.sendMessage("Hello There")
    }
  })

  // add a passive, which acts like a
  // message listener with a predicate
  y.passive(
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
  y.memoryPassive<number>(
    0 /* initial state of memory */,
    async () => true /* predicate */,
    async (_, __, self) => {
      self.memory += 1
      console.log(`Messages received: ${self.memory}`)
    }
  )
})
```

### Extending Yukibot

You can extract the setup to one or morefunctions to sort your code!

```ts

await yuki(async y => {
  extractedSetup(y)
})

function extractedSetup(builder: YukiBuilder) {
  // add a message listener which removes itself
  // if the message says "get out"
  builder.onMessage(
    ({ snippet: { displayMessage } }) => {
      return displayMessage.match(/^get\s+out$/)
    },
    async (_, match) => match !== null,
  )
}
```

#### Custom Routes

Each bot has its own express app which can be added upon

```ts
import yuki, { RouteConfig } from "@pinkilo/yukibot"

const routes: RouteConfig = { dashboard: "/dashboard" }

const bot = await yuki(async (y) => {
  // this will add your routes to the home page for easy access
  // it is optional, but useful
  y.routes = routes
})

bot.express
  // add custom routes
  .get(routes.dashboard, (_, res) => res.status(200))
  .listen(3000, () => console.log(`\nhttp://localhost:${3000}`))
```

## Testing

### Live Testing

You can run your bot in "test" mode which will let you mock events through the
cli.

```ts
async function main() {
  // create a bot instance with the `yuki` dsl
  const bot = await yuki((y) => {
    y.logLevel = "debug"
    y.yukiConfig.name = "MyBot"
    y.yukiConfig.prefix = /^>/
    y.yukiConfig.test = true

    // ... see earlier examples for more dsl
  })

  await bot.start()
}
```

You will be prompted to mock an event (more to come):

```
Select an event to mock:
1: message
2: subscription
3: auth
0: exit
choice:
```

### Programmatic Testing

You can bypass the CLI test mode for programmatic testing, which is useful for
unit tests and the like:

```ts
// This jest unit test example should pass
it("should call mock on command", async () => {
  const commandName = "test"
  const mockFn = jest.fn()
  const ty: TestYuki = testYuki(async (y) => {
    y.command(c => {
      y.name = commandName
      y.invoke = mockFn
    })
  })
  await ty.feedMessage(`>${commandName}`)
  expect(mockFn).toHaveBeenCalledTimes(1)
})
```

## Contributing

Contributing is highly encouraged. It's best to make an issue first to discuss
what you want to add, but we won't stop you from making something cool!

Commits should be focused on specific changes and messages written with
[Conventional Commit](https://www.conventionalcommits.org/en/v1.0.0/#summary):

```
<type>[(optional scope)][!]: <description>

[optional body]

[optional footer(s)]
```

Add a `!` after the type and scope (if it exists) to indicate a BREAKING change.

Types:

- `feat:` a new feature
- `fix:` a bug fix
- `perf:` a code change that improves performance
- `refactor:` a code change that neither fixes a bug nor adds a feature
- `test:` adding or correcting tests
- `docs:` documentation only changes, e.g. jsDocs, README
- `build:` - changes that affect the build or dependencies
- `ci:` Changes to our CI configuration files and scripts
- `style:` changes that do not affect the meaning of the code , e.g., formatting
- `chore:` misc. changes which do not affect the codebase in a meaningful way
  and do not fall under another type listed above
