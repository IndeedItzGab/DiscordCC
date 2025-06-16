import { world } from "@minecraft/server"
import { http, HttpRequest, HttpHeader, HttpRequestMethod} from "@minecraft/server-net"
import { config } from "../../config.js"

world.afterEvents.entityDie.subscribe(event => {
  if(!config.token || !config.channel) return;
  if(event.deadEntity.typeId !== "minecraft:player") return;
  
  const res2 = new HttpRequest(config.webhook)
  res2.method = HttpRequestMethod.Post
  res2.headers = [
    new HttpHeader("Content-Type", `application/json`)
  ]
  res2.body = JSON.stringify({
    embeds: [
      {
        author: {
          name: `${event.deadEntity.name} died`,
          icon_url: "https://cdn.discordapp.com/attachments/1136508489989111901/1383302370489794772/54f4b55a59ff9ddf2a2655c7f35e4356.jpg?ex=684e4c39&is=684cfab9&hm=e5da707d1ba28406db35d8f3c03db56beeed9b644908d5a54f3f9323213d1bdc&"
        },
        color: 0x000000
      }  
    ],
    username: "Newb SMP",
    avatar_url: "https://cdn.discordapp.com/attachments/1136508489989111901/1383287918004801626/ezgif.com-video-to-gif-1.gif?ex=684e3ec3&is=684ced43&hm=bac37521c5461e837dd8e53d56bdf99d107d86e1a505f7015c77d6400d70b67a&"
  })
  
  http.request(res2)
})