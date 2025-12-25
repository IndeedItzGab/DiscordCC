import { world, system } from "@minecraft/server"
import { http, HttpRequest, HttpHeader, HttpRequestMethod} from "@minecraft/server-net"
import { config } from "../../config.js"

world.afterEvents.chatSend.subscribe((event) => {
  if(!config.token || !config.channel) return;
  send({username: event.sender.name, message: {content: event.message}, avatarUrl: "https://cdn.discordapp.com/attachments/1388361920696029265/1453686409977135104/Minecraft_Steve_Face_-_Printable_for_Download.jpg?ex=694e5a78&is=694d08f8&hm=fba0c40ce297ab04bb69c81d2ddeaa50823d31643a488410d5fbbb3def250f26"})
})

export async function send(data = JSON.parse(data)) {
  const res2 = new HttpRequest(config.webhook)
  res2.method = HttpRequestMethod.Post
  res2.headers = [
    new HttpHeader("Content-Type", `application/json`)
  ]

  res2.body = JSON.stringify({
    content: data.message?.content.replaceAll("@here", "`@here`").replaceAll("@everyone", "`@everyone`") || null,
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