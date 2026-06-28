import { config } from "../../../config";
import { system, world} from "@minecraft/server"
import { SlashCommand } from "../CommandRegistration";
import { kickPlayer } from "@minecraft/server-admin"
import { debug } from "../../Client";

SlashCommand.register({
  name: "kick",
  description: "Kick a specific player in the minecraft server",
  options: [
    {
      name: "gamertag",
      description: "The gamertag of the player to kick",
      type: 3,
      required: true
    },
    {
      name: "reason",
      description: "Provide a reason",
      type: 3
    }
  ]
}, async function(interaction) {
  
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

  const gamertag = interaction.options.getString("gamertag");
  const reason = interaction.options.getString("reason") || "No reason given.";

  const player = world.getPlayers().find(p => p.name === gamertag)
  try {
    if(player) {
      kickPlayer(player, reason)
      interaction.reply({
        embeds: [
          {
            author: {
              name: `${gamertag} was kicked | ${reason}`,
              icon_url: config.playerAvatar
            },
            color: 0x00FF00
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
        ],
        flags: 64
      })
    }
  } catch (err) {
    console.error(err)
    interaction.reply({
      embeds: [
        {
          author: {
            name: `Something went wrong. Please try again.`
          },
          color: 0xFF0000
        }
      ],
      flags: 64
    })
  }
})
debug(1, `"kick" slash command loaded`)
