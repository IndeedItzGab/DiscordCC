import { world } from "@minecraft/server"
import { register } from "./ButtonListener";
import messages from "../../messages";

export async function FormListener(interaction) {
  const accounts = JSON.parse(world.getDynamicProperty("accounts") || "[]")
  const gamertag = interaction.data.components[0].components[0].value
  const reason = interaction.data.components[1].components[0].value

  switch(interaction.data.custom_id) {
    case "gamertag_registration": {
      register(interaction, accounts, null, gamertag, reason)
      interaction.reply({
        embeds: [
          {
            title: messages.Synchronization.registered.title,
            description: messages.Synchronization.registered.message.replace("{0}", gamertag),
            color: messages.Synchronization.registered.color
          }
        ],
        flags: 64
      })
      break;
    }
  }
}