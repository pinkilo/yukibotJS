import ParticipationAwards from "./ParticipationAwards"
import Fox from "./Fox"
import {
  aquaticMasteryMessage,
  bankMessage,
  commandsMessage,
  discordMessage,
} from "./TimedMessage"

const passives = [
  ParticipationAwards, Fox.greeting, Fox.good,
  aquaticMasteryMessage, discordMessage, commandsMessage, bankMessage,
]

export { ParticipationAwards, Fox, passives }
