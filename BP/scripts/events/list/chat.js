import { world, system } from "@minecraft/server"
import { http, HttpRequest, HttpHeader, HttpRequestMethod} from "@minecraft/server-net"
import { config } from "../../config.js"

world.afterEvents.chatSend.subscribe((event) => {
  if(!config.token || !config.channel) return;
  send({username: event.sender.name, message: {content: event.message}})
})

export async function send(data = JSON.parse(data)) {
  const res2 = new HttpRequest(config.webhook)
  res2.method = HttpRequestMethod.Post
  res2.headers = [
    new HttpHeader("Content-Type", `application/json`)
  ]

  res2.body = JSON.stringify({
    content: data.message?.content || null,
    embeds: data.message?.embed ? [
      {
        title: data.message?.embed?.title || null,
        description: data.message?.embed?.description || null,
        footer: {
          icon_url: data.message?.embed?.footer?.iconUrl || null,
          text: data.message?.embed?.footer?.text || null
        },
        color: data.message?.embed?.color || null,
        thumbnail: {
          url: data.message?.embed?.thumbnail || null
        },
        timestamp: data.message?.embed?.timestamp === true ? new Date(Date.now()).toISOString() : null
      }
    ] : null,
    username: data.username || null,
    avatar_url: data.avatarUrl || null
  })
  
  const res = await http.request(res2)
  console.info(res.status)
}