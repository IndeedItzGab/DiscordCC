import { world, system } from "@minecraft/server"
import { http, HttpRequest, HttpHeader, HttpRequestMethod} from "@minecraft/server-net"
import { config } from "../../config.js"
import { webhookSend } from "../../utilities/webhookSend.js";
import { getPlayerSkin } from "@minecraft/server-gametest"


world.afterEvents.chatSend.subscribe(async (event) => {
  if(!config.main.botToken || !config.main.relayChannel || !config.alerts.gameChat) return;
  const skin = getPlayerSkin(event.sender)
  
  let avatar;
  if(skin.armSize === "Slim") {
    // Alex Avatar
    avatar = "https://raw.githubusercontent.com/IndeedItzGab/DiscordCC/refs/heads/main/docs/images/alex.jpg"
  } else {
    // Steve Avatar
    avatar = "https://raw.githubusercontent.com/IndeedItzGab/DiscordCC/refs/heads/main/docs/images/steve.jpg"
  }

  webhookSend({
    username: event.sender.name,
    avatar_url: avatar,
    content: event.message.replaceAll("@here", "`@here`").replaceAll("@everyone", "`@everyone`")
  })
})