import { system, world } from "@minecraft/server"
import { config } from "../../config.js"
import { botSend } from "../../utilities/botSend.js"

world.afterEvents.playerLeave.subscribe(async event => {
  if(config.leftNotification) {
    botSend({
      embeds: [
        {
          author: {
            name: `${event.playerName} left the server`,
            icon_url: config.playerAvatar
          },
          color: 0xFF0000
        }
      ]
    })
  }
})