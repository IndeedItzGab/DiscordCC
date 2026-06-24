import { config } from "../../../config";
import { system, world } from "@minecraft/server"
import { SlashCommand } from "../CommandRegistration";
import { debug } from "../../Client";

export function register() {
  SlashCommand.register({
    name: "register",
    description: "Register your minecraft bedrock gamertag to connect to the server.",
    options: [
      {
        name: "gamertag",
        description: "The gamertag of your minecraft bedrocka ccount (Case Sensitive)",
        type: 3,
        required: true
      },
      {
        name: "reason",
        description: "Provide a reason",
        type: 3
      }
    ]
  }, function(interaction) {
    const gamertag = interaction.options.getString("gamertag")
    const reason = interaction.options.getString("reason") || "No reason provided"
    const accounts = JSON.parse(world.getDynamicProperty("accounts") || "[]")
    const accounts_cache = new Map(JSON.parse(world.getDynamicProperty("accounts_cache") || "[]"))

    // Check if the gamertag is already registered
    const data = accounts.find(d => d.gamertag === gamertag && d.id === interaction.member.user.id)
    if(data) {
      if(data.date + (3*24*60*60*1000) >= Date.now() && data.verified) {
        // If registered and verified already (under 3 days)
        interaction.reply({
          embeds: [
            {
              author: {
                name: `You have already registered and verified that gamertag. You can change your registered gamertag after ${Math.ceil((data.date + (3*24*60*60*1000) - Date.now())/(24*60*60*1000))} day(s).`
              },
              color: 0xFF0000,
            }
          ],
          flags: 64
        })
        return;
      } else if(data.date + (3*24*60*60*1000) < Date.now() && data.verified) {
        // If registered and verified already but over 3 days, allow to change with confirmation button
        accounts_cache.set(interaction.member.user.id, {gamertag, reason})
        world.setDynamicProperty("accounts_cache", JSON.stringify(Array.from(accounts_cache.entries())))
        interaction.reply({
          embeds: [
            {
              author: {
                name: `You have already registered and verified that gamertag. Do you want to change your registered gamertag to ${gamertag}?`
              },
              color: 0xFF0000,
            }
          ],
          flags: 64,
          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  label: "Confirm",
                  custom_id: "change_registered_gamertag",
                  style: 1
                }
              ]
            }
          ]
        })
      } else if(!data.verified) {
        // Not verified but allow to change with confirmation button
        accounts_cache.set(interaction.member.user.id, {gamertag, reason})
        world.setDynamicProperty("accounts_cache", JSON.stringify(Array.from(accounts_cache.entries())))
        interaction.reply({
          embeds: [
            {
              author: {
                name: `You have already registered ${data.gamertag} but haven't verified yet. Do you want to change your registered gamertag to ${gamertag}?`
              },
              color: 0xFF0000,
            }
          ],
          flags: 64,
          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  label: "Confirm",
                  custom_id: "change_registered_gamertag",
                  style: 1
                }
              ]
            }
          ]
        })
      }
    } else if (accounts.some(d => d.gamertag === gamertag)) {
      // If the gamertag is already claimed by another user
      interaction.reply({
        embeds: [
          {
            author: {
              name: "That gamertag is already registered by another user."
            },
            color: 0xFF0000
          }
        ],
        flags: 64
      })
    } else {
      // Register with confirmation button
      accounts_cache.set(interaction.member.user.id, {gamertag, reason})
      world.setDynamicProperty("accounts_cache", JSON.stringify(Array.from(accounts_cache.entries())))
      interaction.reply({
        embeds: [
          {
            author: {
              name: `Connect your Discord account to "${gamertag}"?\nOnce the connection is verified, you must wait 72 hours to change your connected gamertag.`
            },
            color: 0x00FFFF
          }
        ],
        flags: 64,
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                label: "Confirm",
                custom_id: "new_register_gamertag",
                style: 1
              }
            ]
          }
        ]
      })
    }
  })
  debug(1, `"register" slash command loaded`)
}
