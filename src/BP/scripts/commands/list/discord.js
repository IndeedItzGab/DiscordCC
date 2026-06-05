import { registerCommand } from "../CommandRegistry.js"  
import { world, system } from "@minecraft/server"
import { config } from "../../config.js"

const commandInformation = {
  name: "discord",
  description: "Get the discord invite link of this server.",
  aliases: [],
  usage: [
    {
      name: "discordcc:discord",
      type: "Enum",
      optional: false
    }
  ]
}

registerCommand(commandInformation, (origin, option) => {
  const executor = origin?.sourceEntity
  switch(option) {
    case "invite": {
      let link;
      if(config.discordInviteLink === "") {
        link = `No discord invite link was provided.`
      } else {
        link = `Discord Invite Link: ${config.discordInviteLink}`
      }
      return executor.sendMessage(link)
    }
  }
})

