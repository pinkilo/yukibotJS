# Yuki the YouTube Fox

Yuki is a YouTube livestream bot built from the ground up for unique interactivity
both on screen and in the chat.

## Commands
[see a list of commands](COMMANDS.md)

## Currency System

- Earn currency by sending messages in chat and using certain [commands](COMMANDS.md)
- currency is persisted to file


## Contributing

```ts
/**
 * @command _name_ <required> [optional]
 */
```

## Roadmap

- ~~Command rate-limiting~~
    - ~~global & user~~
- Fox
    - ~~Remake Yuki the websocket animation and their commands~~
    - add passive reactivity to superchats, donations, etc
- following
    - time user has been sub'ed to channel
- ~~Bank/Wallet~~
    - ~~\>rank~~
        - ~~shows user rank with respect to wallet/bank~~
- \>hug {user?}
    - hugs user or random user
- \>lovemeter {user?}
    - $userid is $randnum(100)% in love with $dummy $touser
    - should have cost
- Raidboss fighting
- UI
    - ~~route that displays the money leaderboard~~
    - refactor css
    - potentially rebuild with svelte?
    - fix speech bubble
