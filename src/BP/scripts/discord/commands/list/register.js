import { config } from "../../../config";
import { system, world } from "@minecraft/server"
import { SlashCommand } from "../CommandRegistration";
import { debug } from "../../Client";
import messages from "../../../messages";


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
  const data = accounts.find(d => d.id === interaction.member.user.id)
  if(data) {
    if(data.date + (3*24*60*60*1000) >= Date.now() && data.verified) {
      // If registered and verified already (under 3 days)
      interaction.reply({
        embeds: [
          {
            title: messages.Synchronization.verifiedGamertagDelay.title,
            description: messages.Synchronization.verifiedGamertagDelay.message.replace("{0}", Math.ceil((data.date + (3*24*60*60*1000) - Date.now())/(24*60*60*1000))),
            color: messages.Synchronization.verifiedGamertagDelay.color,
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
            title: messages.Synchronization.verfiedGamertagAllow.title,
            description: messages.Synchronization.verfiedGamertagAllow.message.replace("{0}", gamertag),  
            color: messages.Synchronization.verfiedGamertagAllow.color,
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
            title: messages.Synchronization.notVerifiedChange.title,
            description: messages.Synchronization.notVerifiedChange.message.replace("{0}", data.gamertag).replace("{1}", gamertag),
            color: messages.Synchronization.notVerifiedChange.color,
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
          title: messages.Synchronization.alreadyUsedByOtherUser.title,
          description: messages.Synchronization.alreadyUsedByOtherUser.message,
          color: messages.Synchronization.alreadyUsedByOtherUser.color
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
          title: messages.Synchronization.confirmGamertag.title,
          description: messages.Synchronization.confirmGamertag.message.replace("{0}", gamertag),
          color: messages.Synchronization.confirmGamertag.color
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

