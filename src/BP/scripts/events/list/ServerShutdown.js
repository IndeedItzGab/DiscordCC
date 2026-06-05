import { system } from "@minecraft/server"
import { config } from "../../config.js"
import { botSend } from "../../utilities/botSend.js";

system.beforeEvents.shutdown.subscribe(async event => {
  if(!config.token || !config.channel || !config.shutdownNotification) return;
  botSend({
    content: "🛑**Server has stopped**"
  })
})