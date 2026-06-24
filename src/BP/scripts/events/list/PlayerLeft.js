import { system, world } from "@minecraft/server"
import { config } from "../../config.js"
import { botSend } from "../../utilities/botSend.js"
import { skinData } from "./PlayerJoined.js"

world.afterEvents.playerLeave.subscribe(async event => {
  if(config.alerts.leftNotification && config.main.botToken && config.main.relayChannel) {
    const skin = skinData.get(event.playerName)
    let avatar
    if(skin?.armSize === "Slim") {
      avatar = "https://raw.githubusercontent.com/IndeedItzGab/DiscordCC/refs/heads/main/docs/images/alex.jpg"
    } else {
      avatar = "https://raw.githubusercontent.com/IndeedItzGab/DiscordCC/refs/heads/main/docs/images/steve.jpg"
    }
    skinData.delete(event.playerName)
    
    botSend({
      embeds: [
        {
          author: {
            name: `${event.playerName} left the server`,
            icon_url: avatar
          },
          color: 0xFF0000
        }
      ]
    })

  }
})