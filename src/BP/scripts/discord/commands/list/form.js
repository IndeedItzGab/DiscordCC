import { config } from "../../../config";
import { system, world} from "@minecraft/server"
import { SlashCommand } from "../CommandRegistration";
import { debug } from "../../Client";
import messages from "../../../messages";

SlashCommand.register({
  name: "form",
  description: "Generate a form for users to fill out.",
  options: [
    {
      name: "submission",
      description: "Submission form for users to fill out.",
      type: 1,
      options: []
    }
  ]
}, async function(interaction) {

  // Filter
  if(!interaction.member?.roles.some(r => config.main.moderatorRoles.includes(r)))
    return interaction.reply({
      embeds: [
        {
          description: messages.notAuthorized,
          color: 0xFF0000
        }
      ],
      flags: 64
    })

  const sub = interaction.options.sub.name

  switch(sub) {
    case "submission": {
      interaction.reply({
        embeds: [
          {
            title: messages.Synchronization.submisisonForm.title,
            description: messages.Synchronization.submisisonForm.message,
            color: messages.Synchronization.submisisonForm.color
          }
        ],
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                label: "apply",
                custom_id: "apply",
                style: 1
              }
            ]
          }
        ]
      })
      break;
    }
  }
})
debug(1, `"form" slash command loaded`)

