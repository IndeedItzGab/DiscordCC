import { http, HttpHeader, HttpRequest, HttpRequestMethod } from "@minecraft/server-net"
import { config } from "../config";

export async function botSend(data) {
  if(!config.main.relayChannel || !config.main.botToken) return;
  const req = new HttpRequest(`https://discord.com/api/v10/channels/${config.main.relayChannel}/messages`)
  req.method = HttpRequestMethod.Post
  req.headers = [
    new HttpHeader("Content-Type", "application/json"),
    new HttpHeader("Authorization", `Bot ${config.main.botToken}`)
  ];


  req.body = JSON.stringify(data)
  await http.request(req)
}