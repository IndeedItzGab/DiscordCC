import { world } from "@minecraft/server"
import { config } from "../../config.js"
import { send } from "./Chats.js"


world.afterEvents.playerJoin.subscribe(event => {
  if(!config.token || !config.channel ) return;

  if(config.joinNotification) {
    send({embed: {
      author: {
        name: `${event.playerName} joined the server`,
        icon_url: config.playerAvatar
      },
      color: 0x00FF00
    }})
  }

})