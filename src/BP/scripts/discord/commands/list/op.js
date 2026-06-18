import { config } from "../../../config";
import { system } from "@minecraft/server"
import { SlashCommand } from "../CommandRegistration";
import { world } from "@minecraft/server"
import { opPlayer } from "@minecraft/server-admin"

export function op() {
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
    if(!interaction.member?.roles.some(r => config.moderatorRoles.includes(r))) return interaction.reply({
      embeds: [
        {
          description: `**You are not allowed to use this command.**`,
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
}
