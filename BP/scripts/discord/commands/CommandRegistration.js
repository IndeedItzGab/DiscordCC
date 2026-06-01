import { HttpRequest, HttpRequestMethod, HttpHeader, http } from "@minecraft/server-net";
import { config } from "../../config.js"
import { announce } from "./list/announce.js"
import { kick } from "./list/kick.js";
import { list } from "./list/list.js";
import { command } from "./list/command.js";
import { shutdown } from "./list/shutdown.js"
import { allowlist } from "./list/allowlist.js";
import { op } from "./list/op.js";
import { deop } from "./list/deop.js";
import { applicationId } from "../Client.js";

let processes = new Map()

export function registerSlashCommands() {
  announce()
  kick()
  list()
  command()

  shutdown()
  allowlist()
  op()
  deop()
}

export async function CommandRegistration(data, process) {
  const req = new HttpRequest(`https://discord.com/api/v10/applications/${applicationId}/commands`)
  req.method = HttpRequestMethod.Post;
  req.headers = [
    new HttpHeader("Authorization", `Bot ${config.token}`),
    new HttpHeader("Content-Type", "application/json")
  ];

  req.body = JSON.stringify(data);
  await http.request(req);
  processes.set(data.name, process)
}

export async function execute(name, interaction) {
  const handler = processes.get(name);

  if (!handler) {
    console.warn(`No handler found for command: ${name}`);
    return;
  }

  return await handler(interaction);
}