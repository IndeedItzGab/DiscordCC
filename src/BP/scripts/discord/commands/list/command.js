import { config } from "../../../config";
import { system, world } from "@minecraft/server"
import { SlashCommand } from "../CommandRegistration";
import { debug } from "../../Client";

export function command() {
  SlashCommand.register({
    name: "command",
    description: "Run a command in the minecraft server.",
    options: [
      {
        name: "command",
        description: "Write the command you want to run without including slash (/)",
        type: 3,
        required: true
      }
    ]
  }, async function(interaction) {

    // Filter
    if(!interaction.member?.roles.some(r => config.main.moderatorRoles.includes(r))) return interaction.reply({
      embeds: [
        {
          description: `**You are not allowed to use this command.**`,
          color: 0xFF0000
        }
      ],
      flags: 64
    })

    const command = interaction.options.getString("command")

    world.getDimension("minecraft:overworld").runCommand(command)
    interaction.reply({
      embeds: [
        {
          description: `Command was executed.`,
          color: 0x00FF00
        }
      ]
    })
  })
  debug(1, `"command" slash command loaded`)
}
