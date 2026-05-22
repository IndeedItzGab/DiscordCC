import { system } from "@minecraft/server"
import { send } from "../Chats.js"

system.afterEvents.scriptEventReceive.subscribe(event => {
  if(event.id !== "discordcc:sendChat") return;
  console.info(event.message)
  const data = JSON.parse(event.message)
  send(data)
})