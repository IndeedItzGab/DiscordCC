import { http, HttpHeader, HttpRequest, HttpRequestMethod } from "@minecraft/server-net"
import { system, world } from "@minecraft/server"

export async function webhookSend(data) {
  const savedWebhook = JSON.parse(world.getDynamicProperty("discordcc:webhook") || "{}")
  if(savedWebhook.url) {
    const res = new HttpRequest(savedWebhook.url)
    res.method = HttpRequestMethod.Post
    res.headers = [
      new HttpHeader("Content-Type", "application/json")
    ]
    res.body = JSON.stringify(data)
    await http.request(res)
  } else {
    return console.warn("No webhook url available.")
  }
}