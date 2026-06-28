import { config } from "../../../config";
import { system, world } from "@minecraft/server"
import { SlashCommand } from "../CommandRegistration";
import { opPlayer } from "@minecraft/server-admin"
import { debug } from "../../Client";

SlashCommand.register({
  name: "op",
  description: "Give a specific player a op permissions.",
  options: [
    {
      name: "gamertag",
      description: "A player you want to give permission.",
      type: 3,
      required: true
    }
  ]
}, function(interaction) {

  // Filter
  if(!interaction.member?.roles.some(r => config.main.moderatorRoles.includes(r))) return interaction.reply({
    embeds: [
      {
        description: messages.notAuthorized,
        color: 0xFF0000
      }
    ],
    flags: 64
  })

  const gamertag = interaction.options.getString("gamertag")
  const player = world.getPlayers().find(p => p.name === gamertag)
  try {
    if(player) {
      opPlayer(player)
      interaction.reply({
        embeds: [
          {
            author: {
              name: `Opped: ${player.name} `
            },
            color: 0x00FFFF
          }
        ]
      })
    } else {
      interaction.reply({
        embeds: [
          {
            author: {
              name: `No targets matched selector`
            },
            color: 0xFF0000
          }
        ]
      })
    }
  } catch (err) {
    if(JSON.stringify(err).includes("PlayerAlreadyOpError")) {
      interaction.reply({
        embeds: [
          {
            author: {
              name: `Could not op (already op or higher): ${player.name}`
            },
            color: 0xFF0000
          }
        ]
      })
    } else {
      console.error(err)
      interaction.reply({
        embeds: [
          {
            author: {
              name: `Something went wrong. Please try again.`
            },
            color: 0xFF0000
          }
        ]
      })
    }
  }
})
debug(1, `"op" slash command loaded`)
