import { system } from "@minecraft/server"
import { config } from "../../config.js"
import { botSend } from "../../utilities/botSend.js";

system.beforeEvents.startup.subscribe(event => {
  if(!config.main.botToken || !config.main.relayChannel || !config.alerts.startedNotification) return;
  system.run(async () => {
    botSend({
      content: "✅ **Server has started**"
    })
  })
})