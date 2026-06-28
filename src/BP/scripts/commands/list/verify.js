import { registerCommand } from "../CommandRegistry.js"  
import { world, system } from "@minecraft/server"
import { config } from "../../config.js"
import { MessageFormData } from "@minecraft/server-ui"

const commandInformation = {
  name: "verify",
  description: "Verify your discord connection.",
  aliases: [],
  usage: []
}

registerCommand(commandInformation, (origin, option) => {
  const executor = origin?.sourceEntity
  const accounts = JSON.parse(world.getDynamicProperty("accounts") || "[]")
  const data = accounts.find(d => d.gamertag === executor.name)
   if(data.verified) {
    executor.sendMessage(`§eYour gamertag has already been verified. You can change your registered gamertag with /register command in discord after ${Math.ceil((data.date + (3*24*60*60*1000) - Date.now())/(24*60*60*1000))} day(s).`)
    return;
  }

  // Show confirmation form
  const form = new MessageFormData()
  form.title("Discord Account Confirmation")
  form.body(`Do you want to verify the connection with ${data.username}'s account?`)
  form.button1("Yes")
  form.button2("No")
  system.run(() => {
    form.show(executor).then(response => {
      if(response.selection === 0) {
        data.verified = true
        world.setDynamicProperty("accounts", JSON.stringify(accounts))
        executor.inputPermissions.setPermissionCategory(1, true)
        executor.inputPermissions.setPermissionCategory(2, true)
        executor.sendMessage("§eYour account has been verified successfully. You can now enjoy the server!")
      } else {
        executor.sendMessage("§cVerification cancelled. Please verify within 3 days to keep playing on the server.")
      }
    })
  })
})

