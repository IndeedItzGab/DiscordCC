import { HttpRequest, HttpRequestMethod, HttpHeader, http } from "@minecraft/server-net";
import { config } from "../../config.js"
import { applicationId, guildId, debug } from "../Client.js";
import { Interaction } from "../modules/Interaction.js";

import { announce } from "./list/announce.js"
import { kick } from "./list/kick.js";
import { command } from "./list/command.js";
import { allowlist } from "./list/allowlist.js";
import { op } from "./list/op.js";
import { deop } from "./list/deop.js";
import { host } from "./list/host.js";
import { player } from "./list/player.js";
import { server } from "./list/server.js";
import { register } from "./list/register.js";
import { gamertag } from "./list/gamertag.js";

//import { form } from "./list/form.js";

let processes = new Map()
export class SlashCommand {
  static async init() {
    announce()
    kick()
    command()
    allowlist()
    op()
    deop()
    player()
    host()
    server()
    register()
    gamertag()
    // form() DO NOT UNCOMMENT THIS IS NOT YET READY

    // Delete old slash commands "shutdown" & "list"
    const req = new HttpRequest(`https://discord.com/api/v10/applications/${applicationId}/guilds/${guildId}/commands`)
    req.method = HttpRequestMethod.Get;
    req.headers = [
      new HttpHeader("Authorization", `Bot ${config.main.botToken}`),
    ];

    const res = await http.request(req);
    for(const command of JSON.parse(res.body)) {
      if(["shutdown", "list"].includes(command.name)) {
        const req = new HttpRequest(`https://discord.com/api/v10/applications/${applicationId}/guilds/${guildId}/commands/${command.id}`)
        req.method = HttpRequestMethod.Delete;
        req.headers = [
          new HttpHeader("Authorization", `Bot ${config.main.botToken}`),
        ];
        await http.request(req);
      }
    }
  }

  static async execute(packet) {
    const handler = processes.get(packet.d.data.name);

    if (!handler) {
      debug(2, `No handler found for command: ${name}`)
      return;
    }

    await handler(new Interaction(packet.d));
  }

  static async register(data, callback) {
    const req = new HttpRequest(`https://discord.com/api/v10/applications/${applicationId}/guilds/${guildId}/commands`)
    req.method = HttpRequestMethod.Post;
    req.headers = [
      new HttpHeader("Authorization", `Bot ${config.main.botToken}`),
      new HttpHeader("Content-Type", "application/json")
    ];

    req.body = JSON.stringify(data);
    processes.set(data.name, callback)
    return await http.request(req);
  }
}

