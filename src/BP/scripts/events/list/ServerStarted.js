import { system } from "@minecraft/server"
import { config } from "../../config.js"
import { botSend } from "../../utilities/botSend.js";

system.beforeEvents.startup.subscribe(event => {
  if(!config.token || !config.channel || !config.startedNotification) return;
  system.run(async () => {
    botSend({
      content: "✅ **Server has started**"
    })
  })
})