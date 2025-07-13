import { world, system } from "@minecraft/server"
import { http, HttpRequest, HttpHeader, HttpRequestMethod} from "@minecraft/server-net"
import { config } from "../../config.js"

world.afterEvents.chatSend.subscribe((event) => {
  if(!config.token || !config.channel) return;
  send({username: event.sender.name, message: {content: event.message}, avatarUrl: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.pinterest.com%2Fpin%2F375487687673255002%2F&psig=AOvVaw2B-al6kKU_QRqwHemEjULK&ust=1752473301217000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCKDnlvmVuY4DFQAAAAAdAAAAABAE"})
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
}