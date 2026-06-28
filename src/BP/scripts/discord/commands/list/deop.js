import { config } from "../../../config";
import { system, world } from "@minecraft/server"
import { SlashCommand } from "../CommandRegistration";
import { deopPlayer } from "@minecraft/server-admin"
import { debug } from "../../Client";
import messages from "../../../messages";

SlashCommand.register({
  name: "deop",
  description: "Remove the op permissions from the specific player.",
  options: [
    {
      name: "gamertag",
      description: "A player you want to remove op permission.",
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
      deopPlayer(player)
      interaction.reply({
        embeds: [
          {
            author: {
              name: `De-opped: ${player.name} `
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
    console.error(err)
    interaction.reply({
      embeds: [
        {
          author: {
            name: `Something went wrong. Please try again. `
          },
          color: 0xFF0000
        }
      ]
    })
  }
})
debug(1, `"deop" slash command loaded`)
