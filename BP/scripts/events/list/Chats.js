import { world, system } from "@minecraft/server"
import { http, HttpRequest, HttpHeader, HttpRequestMethod} from "@minecraft/server-net"
import { config } from "../../config.js"

world.afterEvents.chatSend.subscribe((event) => {
  if(!config.token || !config.channel || !config.gameChat) return;
  send({username: event.sender.name, message: {content: event.message}, avatarUrl: config.playerAvatar})
})

export async function send(data = JSON.parse(data)) {
  const res2 = new HttpRequest(config.webhook)
  res2.method = HttpRequestMethod.Post
  res2.headers = [
    new HttpHeader("Content-Type", `application/json`)
  ]

  res2.body = JSON.stringify({
    content: data.message?.content?.replaceAll("@here", "`@here`")?.replaceAll("@everyone", "`@everyone`") || null,
    embeds: data?.embed ? [
      {
        author: data?.embed?.author || null,
        title: data?.embed?.title || null,
        description: data?.embed?.description || null,
        footer: {
          icon_url: data?.embed?.footer?.iconUrl || null,
          text: data?.embed?.footer?.text || null
        },
        color: data?.embed?.color || null,
        thumbnail: {
          url: data?.embed?.thumbnail || null
        },
        timestamp: data?.embed?.timestamp === true ? new Date(Date.now()).toISOString() : null
      }
    ] : null,
    username: data.username || null,
    avatar_url: data.avatarUrl || null
  })
  
  const res = await http.request(res2)
}