import { config } from "../../../config";
import { system } from "@minecraft/server"
import { CommandRegistration } from "../CommandRegistration";
import { world } from "@minecraft/server"

export function list() {
  CommandRegistration({
    name: "list",
    description: "List all players online in the minecraft bedrock server"
  }, function(interaction) {
    interaction.reply({
      embeds: [
        {
          title: `${world.getPlayers().length} player(s) are online`,
          description: `${world.getPlayers().map(p => p.name).join(" ")}`,
          color: 0x00FF11
        }
      ]
    })
  })
}
