import { config } from "../../../config";
import { system, world } from "@minecraft/server"
import { SlashCommand } from "../CommandRegistration";
import { debug } from "../../Client";

SlashCommand.register({
  name: "gamertag",
  description: "Identify what gamertag is connected to the user's discord account.",
  options: [
    {
      name: "user",
      description: "Choose a user to identify their gamertag.",
      type: 6,
      required: true
    }
  ]
}, function(interaction) {
  const user = interaction.options.getUser("user")
  const accounts = JSON.parse(world.getDynamicProperty("accounts") || "[]")
  const account = accounts.find(a => a.id === user?.id)

  if(account) {
    interaction.reply({
      embeds: [
        {
          author: {
            name: `${account.username}`,
            icon_url: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
          },
          description: `**Gamertag:** ${account.gamertag}\n**Verified:** ${account.verified ? "Yes" : "No"}\n**Date Registered:** ${new Date(account.date).toLocaleString()}\n**Reason:** ${account.reason}`,
          color: 0x00FFFF
          
        }
      ]
    })
  } else {
    interaction.reply({
      embeds: [
        {
          description: `**No gamertag is connected to this user's discord account.**`,
          color: 0xFF0000
        }
      ],
      flags: 64
    })
  }
});
debug(1, `"gamertag" slash command loaded`)
