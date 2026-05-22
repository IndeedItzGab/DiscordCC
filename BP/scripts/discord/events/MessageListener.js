import { world } from "@minecraft/server"
import { http, HttpRequest, HttpHeader, HttpRequestMethod } from "@minecraft/server-net"
import { config } from "../../config.js"

export async function MessageListener(data) {
  if(data.channel_id !== config.channel || data.author.bot || !config.discordChat) return;
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
      const replyData = await JSON.parse(res.body)
      world.sendMessage(config.discordReplyToMessageFormat.replaceAll("$user", data.author.global_name || data.author.username).replaceAll("$replyUser", replyData.author.global_name || replyData.author.username).replaceAll("$message", data.content))
    }
  } else {
    world.sendMessage(config.discordMessageFormat.replaceAll("$user", data.author.global_name || data.author.username).replaceAll("$message", data.content))
  }
}