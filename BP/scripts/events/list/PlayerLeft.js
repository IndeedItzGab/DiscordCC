import { system, world } from "@minecraft/server"
import { config } from "../../config.js"
import { send } from "./Chats.js"

world.afterEvents.playerLeave.subscribe(async event => {
  if(!config.token || !config.channel) return;

  if(config.leftNotification) {
    send({embed: {
      author: {
        name: `${event.playerName} left the server`,
        icon_url: config.playerAvatar
      },
      color: 0xFF0000
    }})
  }
})