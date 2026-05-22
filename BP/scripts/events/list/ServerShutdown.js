import { system } from "@minecraft/server"
import { config } from "../../config.js"
import { send } from "./Chats.js";

system.beforeEvents.shutdown.subscribe(event => {
  if(!config.token || !config.channel || !config.shutdownNotification) return;
  system.run(() => {
    send({message: {
      content:  "🛑**Server has stopped**"
    }})
  })
})