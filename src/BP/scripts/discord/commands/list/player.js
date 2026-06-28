import { config } from "../../../config";
import { system, world } from "@minecraft/server"
import { SlashCommand } from "../CommandRegistration";
import { dedicatedServer } from "@minecraft/server-admin"
import { debug } from "../../Client";

// will be refactored //

SlashCommand.register({
  name: "player",
  description: "Manage the players in the server",
  options: [
    {
      name: "list",
      description: "List all players online in the minecraft bedrock server",
      type: 1,
      options: []
    },
    {
      name: "location",
      description: "Locate the coordination of specified player.",
      type: 1,
      options: [
        {
          name: "gamertag",
          description: "Gamertag of the player you want to view.",
          type: 3,
          required: true
        }
      ]
    },
    {
      name: "info",
      description: "View information about a specific player.",
      type: 1,
      options: [
        {
          name: "gamertag",
          description: "Gamertag of the player you want to view.",
          type: 3,
          required: true
        }
      ]
    }
  ]
}, async function(interaction) {
  const sub = interaction.options.sub.name
  const gamertag = interaction.options.getSubString("gamertag")
  const player = world.getPlayers().find(player => player.name === gamertag)

  if(!interaction.member?.roles.some(r => config.main.moderatorRoles.includes(r)) && ["location"].includes(sub)) {
    interaction.reply({
      embeds: [
        {
          description: messages.notAuthorized,
          color: 0xFF0000
        }
      ],
      flags: 64
    })
    return;
  }
  
  if(!player && ["location", "info"].includes(sub)) {
    interaction.reply({
      embeds: [
        {
          author: {
            name: `That player is not currently online.`
          },
          color: 0xFF0000
        }
      ],
      flags: 64
    })
    return;
  }

  switch(sub) {
    case "list": {
      interaction.reply({
        embeds: [
          {
            title: `${world.getPlayers().length} player(s) are online`,
            description: `${world.getPlayers().map(p => p.name).join(" ")}`,
            color: 0x00FF11
          }
        ]
      })
      break;
    }
    case "location": {
      interaction.reply({
        embeds: [
          {
            title: `${gamertag}'s coordinate`,
            description: `${player.location.x.toFixed(2)} ${player.location.y.toFixed(2)} ${player.location.z.toFixed(2)}`,
            color: 0x00FF11
          }
        ],
        flags: 64
      })
      break;
    }
    case "info": {
      const location = `${player.location.x.toFixed(2)}x ${player.location.y.toFixed(2)}y ${player.location.z.toFixed(2)}z`
      const currentBiome = player.dimension.getBiome(player.location).id
      const dimension = player.dimension.id
      const place = player.isInWater ? "In Water" : "On Ground"
      const action = currentAction(player);
      const level = `${player.level} (${player.xpEarnedAtCurrentLevel}/${player.xpEarnedAtCurrentLevel+player.totalXpNeededForNextLevel})`
      const nametag = player.nameTag
      const permission = playerPermission(player)
      const gamemode = player.getGameMode()
      const spawnpoint = player.getSpawnPoint() ?? world.getDefaultSpawnLocation()
      const platformType = player.clientSystemInfo.platformType
      const maxRenderDistance = player.clientSystemInfo.maxRenderDistance
      const language = player.clientSystemInfo.locale
      const graphicMode = player.graphicsMode
      const ping = player.getPing()
      let  user = JSON.parse(world.getDynamicProperty("accounts") || "[]").find(d => d.gamertag === gamertag)?.id
      user = user ? `<@${user}>` : "Not linked to a discord account"
      let data = {}

      if(interaction.member?.roles.some(r => config.main.moderatorRoles.includes(r))) {
        // Moderator respond
        data = {
          content: `**Nametag:** ${nametag}
**DIscord Account:** ${user}
**Language:** ${language}
**Ping:** ${ping}
**Current Action:** ${action}
**Platform:** ${platformType}
**Permission:** ${permission}
**Gamemode:** ${gamemode}
**Dimension:** ${dimension}
**Location:** ${location}
**Biome:** ${currentBiome}
**Place:** ${place}
**Level:** ${level}
**Spawnpoint:**
- **Dimension:** ${spawnpoint.dimension?.id || "minecraft:overworld"}
- **Coordinates:** ${spawnpoint.x}x ${spawnpoint.y}y ${spawnpoint.z}z
**Graphic Mode:** ${graphicMode}
**Max Render Distance:** ${maxRenderDistance}`,
          mod: true
        }
      } else {
        // Default respond
        data = {
          content: `**Nametag: ${nametag}
**Discord Account:** ${user}
**Language:** ${language}
**Ping:** ${ping}
**Platform:** ${platformType}
**Permission:** ${permission}
**Graphic Mode:** ${graphicMode}
**Max Render Distance:** ${maxRenderDistance}`
        }
      }

      interaction.reply({
        embeds: [
          {
            author: {
              name: gamertag,
              icon_url: "https://raw.githubusercontent.com/IndeedItzGab/DiscordCC/refs/heads/main/docs/images/steve.jpg"
            },
            description: data.content,
            color: 0x00FF11
          }
        ],
        flags: data.mod ? 64 : null
      })
      break;
    }
  }
})
debug(1, `"player" slash command loaded`)


function playerPermission(player) {
  switch(player.playerPermissionLevel) {
    case 0: {
      return "Visitor";
    }
    case 1: {
      return "Member";
    }
    case 2: {
      return "Operator";
    }
     case 3: {
      return "Custom";
    }
  }
}

function currentAction(player) {
  if(!player.isValid) return;

  if(player.isClimbing) {
    return "Climbing"
  } else if(player.isFalling) {
    return "Falling"
  } else if(player.isSleeping) {
    return "Sleeping"
  } else if(player.isSneaking) {
    return "Falling"
  } else if(player.isFalling) {
    return "Sneaking"
  } else if(player.isSprinting) {
    return "Sprinting"
  } else if(player.isSwimming) {
    return "Swimming"
  } else if(player.isEmoting) {
    return "Emoting"
  } else if(player.isFlying) {
    return "Flying"
  } else if(player.isGliding) {
    return "Gliding"
  } else if(player.isJumping) {
    return "Jumping"
  } else {
    return "Idle"
  }
}