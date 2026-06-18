import { world, system } from "@minecraft/server"
import { getPlayerSkin } from "@minecraft/server-gametest"
import { config } from "../../config.js"
import { botSend } from "../../utilities/botSend.js";

export const skinData = new Map()
world.afterEvents.playerSpawn.subscribe(event => {
  if(config.joinNotification && event.initialSpawn) {
    system.run(() => {
      let avatar;
      const skin = getPlayerSkin(event.player)
      skinData.set(event.player.name, skin)
      if(skin.armSize === "Wide") {
        avatar = "https://raw.githubusercontent.com/IndeedItzGab/DiscordCC/refs/heads/main/docs/images/steve.jpg"
      } else {
        avatar = "https://raw.githubusercontent.com/IndeedItzGab/DiscordCC/refs/heads/main/docs/images/alex.jpg"
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
})