import { config } from "../../../config";
import { SlashCommand } from "../CommandRegistration";
import { debug } from "../../Client";

export function host() {
  SlashCommand.register({
    name: "host",
    description: "View the address and port of the server",
    options: []
  }, async function(interaction) {

    // Filter
    if(config.serverName === "" || config.serverAddress === "" || config.serverPort === "") {
      interaction.reply({
        embeds: [
          {
            author: {
              name: `No server adress or port provided.`
            },
            color: 0xFF0000
          }
        ]
      })
      return;
    }

    interaction.reply({
      embeds: [
        {
          title: `${config.serverName}`,
          description: `**Address:** ${config.serverAddress}\n**Port:** ${config.serverPort}`,
          color: 0x00FF11
        }
      ]
    })
  })
  debug(1, `"host" slash command loaded`)
}
