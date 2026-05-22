import { system } from "@minecraft/server"
import { config } from "../../config.js"
import { send } from "./Chats.js"

system.beforeEvents.startup.subscribe(event => {
  if(!config.token || !config.channel || !config.startedNotification) return;
  system.run(() => {
    send({message: {
      content:  "✅**Server has started**"
    }})
  })
})