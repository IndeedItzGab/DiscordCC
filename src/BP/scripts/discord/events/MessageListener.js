import { world } from "@minecraft/server"
import { http, HttpRequest, HttpHeader, HttpRequestMethod } from "@minecraft/server-net"
import { config } from "../../config.js"
import { guilds } from "../Client.js";

export async function MessageListener(data) {
  if(data.channel_id !== config.channel || data.author.bot || !config.discordChat) return;
  
  // Assigning color name and unicode role
  let prefixName;
  if(guilds.get(data.guild_id).owner_id === data.author.id) {
    prefixName = `§e `
  } else if(data.member?.roles.some(r => config.moderatorRoles.includes(r))) {
    prefixName = `§d `
  } else {
    prefixName = `§3`
  }
  const name = `${prefixName}${data.author.global_name || data.author.username}`

  if(data.message_reference?.message_id) {
    const request = new HttpRequest(
        `https://discord.com/api/v10/channels/${config.channel}/messages/${data.message_reference.message_id}`
    );
    request.method = HttpRequestMethod.Get;
    request.headers = [
        new HttpHeader(
            "Authorization",
            `Bot ${config.token}`
        )
    ];

    const res = await http.request(request);
    if(res.status === 200) {
      const replyData =  JSON.parse(res.body)
      world.sendMessage(config.discordReplyToMessageFormat.replaceAll("$user", name).replaceAll("$replyUser", replyData.author.global_name || replyData.author.username).replaceAll("$message", data.content))
    }
  } else {
    world.sendMessage(config.discordMessageFormat.replaceAll("$user", name).replaceAll("$message", data.content))
  }
}