import { config } from "../../../config";
import { system, world } from "@minecraft/server"
import { SlashCommand } from "../CommandRegistration";
import { debug } from "../../Client";

SlashCommand.register({
  name: "announce",
  description: "Send an announcement to the minecraft server",
  options: [
    {
      name: "content",
      description: "The content of your announcement",
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

  const content = interaction.options.getString("content")

  world.sendMessage(`§7[§b§l ANNOUNCEMENT§r§7]§r\n${content}`)
  interaction.reply({
    embeds: [
      {
        title: `Announcement`,
        description: `${content}`,
        color: 0x00FFFF,
        timestamp: new Date().toISOString()
      }
    ]
  })
})
debug(1, `"announce" slash command loaded`)

