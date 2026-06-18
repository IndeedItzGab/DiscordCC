import { config } from "../../../config";
import { SlashCommand } from "../CommandRegistration";
import { dedicatedServer } from "@minecraft/server-admin"
import { system, world } from "@minecraft/server"
import { guilds } from "../../Client";

// will be refactored //

export function server() {
  SlashCommand.register({
    name: "server",
    description: "Manage the minecraft bedrock server.",
    options: [
      {
        name: "info",
        description: "View information about the bedrock server.",
        type: 1,
        options: []
      },
      {
        name: "shutdown",
        description: "Shutdown the minecraft bedrock server.",
        type: 1,
        options: []
      }
    ]
  }, async function(interaction) {
    const sub = interaction.options.sub.name

    switch(sub) {
      case "info": {
        const elapsedSeconds = (Date.now() - tickStart) / 1000;
        const tick5s = getTPS(5)
        const tick10s = getTPS(10)
        const tick60s = getTPS(60)
        const tick5m = getTPS(300)
        const tick10m = getTPS(600)
        const extension = guilds.get(interaction.guild.id)?.icon?.startsWith("a_") ? "gif" : "png";
    
        interaction.reply({
          embeds: [
            {
              author: {
                name: "Server Information",
                icon_url: `https://cdn.discordapp.com/icons/${interaction.guild.id}/${guilds.get(interaction.guild.id)?.icon}.${extension}?size=1024`
              },
              thumbnail: {
                url:  `https://cdn.discordapp.com/icons/${interaction.guild.id}/${guilds.get(interaction.guild.id)?.icon}.${extension}?size=1024`
              },
              description: `**Name:** ${config.serverName || "Not provided"}
**Address:** ${config.serverAddress || "Not provided"}
**Port:** ${config.serverPort || "Not provided"}
**Online Player(s):** ${world.getPlayers().length}
**Average TPS:** ${Math.min(20, (ticks / elapsedSeconds).toFixed(2))}
> **5 seconds:** ${tick5s}
> **10 seconds:** ${tick10s}
> **60 seconds:** ${tick60s}
> **5 minutes:** ${tick5m}
> **10 minutes:** ${tick10m}`,
              color: 0x00FFff
            }
          ]
        })
        
        break;
      }
      case "shutdown": {
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
        break;
      }
    }
  })
}


let ticks = 0;
const history = [];
const tickStart = Date.now()

system.runInterval(() => {
    ticks++;
});

system.runInterval(() => {
    history.push({
        tick: ticks,
        time: Date.now()
    });

    // Keep only 10 minutes
    if (history.length > 600) {
        history.shift();
    }
}, 20);

function getTPS(seconds) {
    const index = history.length - seconds;

    if (index < 0) return "N/A";

    const old = history[index];
    const tickDiff = ticks - old.tick;
    const timeDiff = (Date.now() - old.time) / 1000;

    return Math.min(20, tickDiff / timeDiff).toFixed(2);
}