import { system } from "@minecraft/server"
import { webhookSend } from "../../../utilities/webhookSend";
import { botSend } from "../../../utilities/botSend";

system.afterEvents.scriptEventReceive.subscribe(event => {
  const data = JSON.parse(event.message)
  if(event.id === "discordcc:botSend") {
    botSend(data)
  } else if(event.id === "discordcc:webhookSend") {
    webhookSend(data)
  }
})