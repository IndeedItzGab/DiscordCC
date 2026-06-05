import { world, system } from "@minecraft/server"
import { http, HttpRequest, HttpHeader, HttpRequestMethod} from "@minecraft/server-net"
import { config } from "../../config.js"
import { webhookSend } from "../../utilities/webhookSend.js";


world.afterEvents.chatSend.subscribe((event) => {
  if(!config.token || !config.channel || !config.gameChat) return;
  webhookSend({
    username: event.sender.name,
    avatar_url: config.playerAvatar,
    content: event.message.replaceAll("@here", "`@here`").replaceAll("@everyone", "`@everyone`")
  })
})