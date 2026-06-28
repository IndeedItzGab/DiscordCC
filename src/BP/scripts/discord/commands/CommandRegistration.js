import { HttpRequest, HttpRequestMethod, HttpHeader, http } from "@minecraft/server-net";
import { config } from "../../config.js"
import { applicationId, guildId, debug } from "../Client.js";
import { Interaction } from "../modules/Interaction.js";

const commands = []
const processes = new Map()
export class SlashCommand {
  static async init() {
    const req = new HttpRequest(`https://discord.com/api/v10/applications/${applicationId}/guilds/${guildId}/commands`)
    req.method = HttpRequestMethod.Put;
    req.headers = [
      new HttpHeader("Authorization", `Bot ${config.main.botToken}`),
      new HttpHeader("Content-Type", "application/json")
    ];

    req.body = JSON.stringify(commands);
    return await http.request(req);
  }

  static async execute(packet) {
    const handler = processes.get(packet.d.data.name)
    if (!handler) 
      return debug(2, `No handler found for command: ${packet.d.data.name}`);

    await handler(new Interaction(packet.d));
  }

  static register(data, callback) {
    if(processes.has(data.name)) return;
    commands.push(data)
    processes.set(data.name, callback)
  }
}

