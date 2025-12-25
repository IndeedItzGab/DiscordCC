import { system, world } from "@minecraft/server"
import { http, HttpRequest, HttpHeader, HttpRequestMethod} from "@minecraft/server-net"
import { config } from "../../config.js"

let lastMs = 0;
if(config.token && config.channel) {
  system.runInterval( async () => {
    try {
      const res2 = new HttpRequest(`https://discord.com/api/v10/channels/${config.channel}/messages`)
      res2.method = HttpRequestMethod.Get,
      res2.headers = [
        new HttpHeader("Authorization", `Bot ${config.token}`)
      ]
       
      const res = await http.request(res2)
      if(res.status === 200) {
        const data = await JSON.parse(res.body)


        const messages = data.filter(d => {
          const t = d.timestamp.replace(/(\.\d{3})\d+/, '$1');
  
          const ms = Date.parse(t);
          if(lastMs < ms && !d.author.bot) {
            lastMs = ms
            return true
          }
          return false
        })
        if(messages.length > 0) {
          messages.forEach(async message => {

            // Fetch replied message data if found
            
            if(message.message_reference?.message_id) {
              const replyHeader = new HttpRequest(`https://discord.com/api/v10/channels/${config.channel}/messages/${message.message_reference.message_id}`)
              replyHeader.method = HttpRequestMethod.Get,
              replyHeader.headers = [
                new HttpHeader("Authorization", `Bot ${config.token}`)
              ]

              const res = await http.request(replyHeader)
              if(res.status === 200) {
                const data = await JSON.parse(res.body)

                world.sendMessage(`§7[§bDiscord§7] §3${message.author.global_name || message.author.username} §7replying to §3${data.author.global_name || data.author.username}§7:§r ${message.content}`)
              }
            } else {
              world.sendMessage(`§7[§bDiscord§7] §3${message.author.global_name || message.author.username}§7:§r ${message.content}`)
            }
          })
        }
      } else {
        console.error("§4A minor error occured.")
      }
    } catch (err) {
      console.error(err)
    }
  }, 1*20)
} else {
  console.warn("No discord token or channel was provided.")
}