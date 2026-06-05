import { world } from "@minecraft/server"
import { config } from "../../config.js"
import { botSend } from "../../utilities/botSend.js";

world.afterEvents.playerJoin.subscribe(event => {
  if(config.joinNotification) {
    botSend({
      embeds: [
        {
        author: {
          name: `${event.playerName} joined the server`,
          icon_url: config.playerAvatar
        },
        color: 0x00FF00
        }
      ]
    })
  }
})