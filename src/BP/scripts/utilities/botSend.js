import { http, HttpHeader, HttpRequest, HttpRequestMethod } from "@minecraft/server-net"
import { config } from "../config";

export async function botSend(data) {
  if(!config.channel || !config.token) return;
  const req = new HttpRequest(`https://discord.com/api/v10/channels/${config.channel}/messages`)
  req.method = HttpRequestMethod.Post
  req.headers = [
    new HttpHeader("Content-Type", "application/json"),
    new HttpHeader("Authorization", `Bot ${config.token}`)
  ];


  req.body = JSON.stringify(data)
  await http.request(req)
}