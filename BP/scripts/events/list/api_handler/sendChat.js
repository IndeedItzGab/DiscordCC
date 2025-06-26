import { system } from "@minecraft/server"
import { send } from "../chat.js"

system.afterEvents.scriptEventReceive.subscribe(event => {
  if(event.id !== "discordcc:sendChat") return;
  console.info(event.message)
  const data = JSON.parse(event.message)
  send(data)
})