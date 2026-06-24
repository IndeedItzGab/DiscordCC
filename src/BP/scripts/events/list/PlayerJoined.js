import { world, system } from "@minecraft/server"
import { getPlayerSkin } from "@minecraft/server-gametest"
import { beforeEvents } from "@minecraft/server-admin"
import { config } from "../../config.js"
import { botSend } from "../../utilities/botSend.js";

export const skinData = new Map()
world.afterEvents.playerSpawn.subscribe(event => {
  if(!event.initialSpawn) return;

  // Alert Notification
  if(config.alerts.joinNotification && config.main.botToken && config.main.relayChannel) {
    system.run(() => {
      let avatar;
      const skin = getPlayerSkin(event.player)
      skinData.set(event.player.name, skin)
      if(skin.armSize === "Slim") {
        avatar = "https://raw.githubusercontent.com/IndeedItzGab/DiscordCC/refs/heads/main/docs/images/alex.jpg"
      } else {
        avatar = "https://raw.githubusercontent.com/IndeedItzGab/DiscordCC/refs/heads/main/docs/images/steve.jpg"
      }

      botSend({
        embeds: [
          {
          author: {
            name: `${event.player.name} joined the server`,
            icon_url: avatar
          },
          color: 0x00FF00
          }
        ]
      })
    })
  }

  // Show confirmation chat for discord connection
  const accounts = JSON.parse(world.getDynamicProperty("accounts") || "[]")
  const data = accounts.find(d => d.gamertag === event.player.name)
  if(data && !data.verified) {
    event.player.inputPermissions.setPermissionCategory(1, false)
    event.player.inputPermissions.setPermissionCategory(2, false)
    event.player.sendMessage(`§eYour gamertag is registered but not verified yet. Please verify the connection from ${data.username} within 3 days to keep playing on the server. Type §a/verify§e in the chat.`)
    
  }
})

// Prevent unregistered players from joining the server
world.afterEvents.worldLoad.subscribe(event => {
  if(!config.Synchronization.enable) return;
  beforeEvents.asyncPlayerJoin.subscribe(event => {
    const accounts = JSON.parse(world.getDynamicProperty("accounts") || "[]")
    if(accounts.some(d => d.gamertag === event.name && (!config.Synchronization.autoAccept && d.verified))) {
      event.allowJoin()
    } else {
      event.disallowJoin(!accounts.some(d => d.gamertag === event.name) ? "You must register your gamertag in the discord server to join this server." : "You must wait for a moderator to verify your gamertag in the discord server to join this server.")
    }
  })
})
