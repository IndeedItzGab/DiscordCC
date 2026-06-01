import { config } from "../../../config";
import { system } from "@minecraft/server"
import { CommandRegistration } from "../CommandRegistration";
import { world } from "@minecraft/server"
import { dedicatedServer } from "@minecraft/server-admin"

export function shutdown() {
  CommandRegistration({
    name: "shutdown",
    description: "Shutdown the minecraft server.",
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


    dedicatedServer.stopServer()
    interaction.reply({
      embeds: [
        {
          author: {
            name: "Shutdown server requested."
          },
          color: 0x00FF00 
        }
      ]
    })
  })
}
