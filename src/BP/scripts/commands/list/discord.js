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
    },
    {
      name: "args",
      type: "String",
      optional: true
    }
  ]
}

registerCommand(commandInformation, (origin, option, args) => {
  const executor = origin?.sourceEntity
  switch(option) {
    case "invite": {
      let link;
      if(!config.discordInviteLink) {
        link = `§cNo discord invite link was provided.`
      } else {
        link = `§eDiscord Invite Link: §b${config.discordInviteLink}`
      }
      return executor.sendMessage(link)
    }
    case "account": {
      const accounts = JSON.parse(world.getDynamicProperty("accounts") || "[]")
      const account = accounts.find(d => d.gamertag === args)
      if(account) {
        return executor.sendMessage(`§a${account.username}§e is connected to this gamertag.`);
      } else {
        return executor.sendMessage(`§cNo discord account is connected to that gamertag.`);
      }
    }
  }
})

