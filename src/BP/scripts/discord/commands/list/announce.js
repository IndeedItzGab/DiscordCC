import { config } from "../../../config";
import { system } from "@minecraft/server"
import { SlashCommand } from "../CommandRegistration";
import { world } from "@minecraft/server"

export function announce() {
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
    if(!interaction.member?.roles.some(r => config.moderatorRoles.includes(r))) return interaction.reply({
      embeds: [
        {
          description: `**You are not allowed to use this command.**`,
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
}
