import { config } from "../../../config";
import { system } from "@minecraft/server"
import { SlashCommand } from "../CommandRegistration";
import { world } from "@minecraft/server"
import { dedicatedServer } from "@minecraft/server-admin"

// add
// remove
// enable
// disable
export function allowlist() {
  SlashCommand.register({
    name: "allowlist",
    description: "Manage the server whitelist",
    options: [
      {
        name: "add",
        description: "Add a player to the whitelist.",
        type: 1,
        options: [
          {
            name: "gamertag",
            description: "Gamertag of a player to add to whitelist.",
            type: 3,
            required: true
          }
        ]
      },
      {
        name: "remove",
        description: "Remove a pleyer from the whitelist.",
        type: 1,
        options: [
          {
            name: "gamertag",
            description: "Gamertag of a player from the whitelist.",
            type: 3,
            required: true
          }
        ]
      },
      {
        name: "enable",
        description: "Enable the whitelist on the server.",
        type: 1
      },
      {
        name: "disable",
        description: "Disable the whitelist on the server.",
        type: 1
      }
    ]
  }, async function(interaction) {

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

    const sub = interaction.options.sub.name
    const gamertag = interaction.options.getSubString("gamertag")
    dedicatedServer.allowList.reloadFile() // I don't think this is necessary but I'll include it just incase

    switch(sub) {
      case "add":
        try {
          if(dedicatedServer.allowList.contains(gamertag)) {
            interaction.reply({
              embeds: [
                {
                  author: {
                    name: `${gamertag} is already in the allowlist.`
                  },
                  color: 0xFF0000
                }
              ]
            })
          } else {
            dedicatedServer.allowList.add(gamertag)
            interaction.reply({
              embeds: [
                {
                  author: {
                    name: `Added ${gamertag} to the allowlist.`
                  },
                  color: 0x00FF00
                }
              ]
            })
          }
        } catch (err) {
          interaction.reply({
            embeds: [
              {
                author: {
                  name: `Could not add ${gamertag} to the allowlist.`
                },
                color: 0xFF0000
              }
            ]
          })
        }
        
        break;
      case "remove":
        try {
          if(!dedicatedServer.allowList.contains(gamertag)) {
            interaction.reply({
              embeds: [
                {
                  author: {
                    name: `${gamertag} is not in the allowlist.`
                  },
                  color: 0x00FF00
                }
              ]
            })
          } else {
            dedicatedServer.allowList.remove(gamertag)
            interaction.reply({
              embeds: [
                {
                  author: {
                    name: `Removed ${gamertag} to the allowlist.`
                  },
                  color: 0x00FF00
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
                  name: `Could not remove ${gamertag} from the allowlist.`
                },
                color: 0xFF0000
              }
            ]
          })
        }
        break;
      case "enable":
        if(dedicatedServer.allowList.enabled) {
          interaction.reply({
            embeds: [
              {
                author: {
                  name: "Whitelist is already enabled."
                },
                color: 0xFF0000
              }
            ]
          })
        } else {
          dedicatedServer.allowList.enabled = true
          interaction.reply({
            embeds: [
              {
                author: {
                  name: "Whitelist has been enabled"
                },
                color: 0x00FF00
              }
            ]
          })
        }
      break;
      case "disable":
        if(!dedicatedServer.allowList.enabled) {
          interaction.reply({
            embeds: [
              {
                author: {
                  name: "Whitelist is already disabled."
                },
                color: 0xFF0000
              }
            ]
          })
        } else {
          dedicatedServer.allowList.enabled = false
          interaction.reply({
            embeds: [
              {
                author: {
                  name: "Whitelist has been disabled"
                },
                color: 0x00FF00
              }
            ]
          })
        }
        break;
    }
  })
}
