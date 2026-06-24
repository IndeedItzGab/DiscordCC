import { world } from "@minecraft/server"
import { http, HttpRequest, HttpHeader, HttpRequestMethod } from "@minecraft/server-net"
import { config } from "../../config.js"
import { guildId } from "../Client.js"

export async function ButtonListener(interaction) {
  const accounts = JSON.parse(world.getDynamicProperty("accounts") || "[]")
  const accounts_cache = new Map(JSON.parse(world.getDynamicProperty("accounts_cache") || "[]"))
  const gamertag = accounts_cache?.get(interaction.member.user.id)?.gamertag || accounts.find(d => d.id === interaction.member.user.id)?.gamertag
  const reason = accounts_cache?.get(interaction.member.user.id)?.reason || "No reason provided"

  switch(interaction.data.custom_id) {
    case "new_register_gamertag": {
      // New registration
      accounts.push({
        id: interaction.member.user.id,
        username: interaction.member.user.username,
        gamertag: gamertag,
        reason: reason,
        verified: false,
        date: Date.now()
      })
      world.setDynamicProperty("accounts", JSON.stringify(accounts))
      accounts_cache.delete(interaction.member.user.id)
      world.setDynamicProperty("accounts_cache", JSON.stringify(Array.from(accounts_cache.entries())))
      interaction.reply({
        embeds: [
          {
            author: {
              name: `${gamertag} gamertag is now connected to your Discord account.`
            },
            color: 0x00FF00
          }
        ],
        flags: 64
      })

      if(!config.Synchronization.autoAccept) {
        // Send notification to moderators channel for verification
        const req = new HttpRequest(`https://discord.com/api/v10/channels/${config.Synchronization.respondChannel}/messages`)
        req.method = HttpRequestMethod.Post;
        req.headers = [new HttpHeader("Content-Type", "application/json"), new HttpHeader("Authorization", `Bot ${config.main.botToken}`)];
        req.body = JSON.stringify({
          embeds: [
            {
              author: {
                name: `${interaction.member.user.username}`,
                icon_url: interaction.member.user.avatarUrl
              },
              description: `**Gamertag:** ${gamertag}\n**Reason:** ${reason}`,
              color: 0xFFFF00,
              footer: {
                text: `ID: ${interaction.member.user.id}`
              },
              timestamp: new Date().toISOString()
            }
          ],
          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  label: "Accept",
                  custom_id: "accept_applicant",
                  style: 1
                },
                {
                  type: 2,
                  label: "Reject",
                  custom_id: "reject_applicant",
                  style: 4
                }
              ]
            }
          ]
        });

        await http.request(req);
      } else if(config.Synchronization.roleToAdd) {
        // Add role
        const req = new HttpRequest(`https://discord.com/api/v10/guilds/${guildId}/members/${interaction.member.user.id}/roles/${config.Synchronization.roleToAdd}`)
        req.method = HttpRequestMethod.Put;
        req.headers = [new HttpHeader("Authorization", `Bot ${config.main.botToken}`)];
        await http.request(req)
      }
      break;
    }
    case "change_registered_gamertag": {
      // Change registered gamertag
      const index = accounts.findIndex(d => d.id === interaction.member.user.id)
      if (index !== -1) {
        accounts[index].gamertag = gamertag
        accounts[index].date = Date.now()
        world.setDynamicProperty("accounts", JSON.stringify(accounts))
      }
      accounts_cache.delete(interaction.member.user.id)
      world.setDynamicProperty("accounts_cache", JSON.stringify(Array.from(accounts_cache.entries())))
      interaction.reply({
        embeds: [
          {
            author: {
              name: `Your registered gamertag has been changed to ${gamertag}.`
            },
            color: 0x00FF00
          }
        ],
        flags: 64
      })
      break;
    }
    case "apply": { // TODO: will be implemented in the future update, ignore for now
      break;
    }
    case "accept_applicant": {
      // accept the applicant as moderator and send them a DM
      if(!interaction.member.roles.some(r => config.main.moderatorRoles.includes(r))) {
        return interaction.reply({
          content: "You are not authorized to perform this action.",
          flags: 64
        })
      }

      //===================================================================//
      // Create a dm channel with the user (will be refactor))
      dm(interaction.message.embeds[0].footer.text.split("ID: ")[1], {
        embeds: [
          {
            // Make this embed look formal
            title: "Gamertag Registration Accepted",
            description: `Your gamertag registration has been accepted by a moderator. You may now play on the server using your registered gamertag.`,
            color: 0x00FF00,
            timestamp: new Date().toISOString()
          }
        ]
      })
      //===================================================================//
      // Add the role to the user
      if(config.Synchronization.roleToAdd) {
        const req = new HttpRequest(`https://discord.com/api/v10/guilds/${guildId}/members/${interaction.message.embeds[0].footer.text.split("ID: ")[1]}/roles/${config.Synchronization.roleToAdd}`)
        req.method = HttpRequestMethod.Put;
        req.headers = [new HttpHeader("Authorization", `Bot ${config.main.botToken}`)];
        await http.request(req)
      }
    //===================================================================//
      // Edit the message in the registration channel to indicate that the applicant has been accepted
      const req = new HttpRequest(`https://discord.com/api/v10/channels/${config.Synchronization.respondChannel}/messages/${interaction.message.id}`)
      req.method = HttpRequestMethod.Patch;
      req.headers = [new HttpHeader("Content-Type", "application/json"), new HttpHeader("Authorization", `Bot ${config.main.botToken}`)];
      req.body = JSON.stringify({
        embeds: [
          {
            author: {
              name: `${interaction.message.embeds[0].author.name} (Accepted)`,
              icon_url: interaction.message.embeds[0].author.icon_url
            },
            description: interaction.message.embeds[0].description,
            color: 0x00FF00,
            footer: {
              text: interaction.message.embeds[0].footer.text
            },
            timestamp: interaction.message.embeds[0].timestamp
          }
        ],
        components: []
      })

      await http.request(req);
      //===================================================================//

      // Update the applicant's verified status
      const index = accounts.findIndex(d => d.id === interaction.message.embeds[0].footer.text.split("ID: ")[1])
      if (index !== -1) {
        accounts[index].verified = true
        world.setDynamicProperty("accounts", JSON.stringify(accounts))
      }

      break;
    }
    case "reject_applicant": {
      // reject the applicant as moderator and send them a DM
      dm(interaction.message.embeds[0].footer.text.split("ID: ")[1], {
        embeds: [
          {
            title: "Gamertag Registration Rejected",
            description: `Your gamertag registration has been rejected by a moderator. Please contact a moderator for more information.`,
            color: 0xFF0000,
            timestamp: new Date().toISOString()

          }
        ],
      })
      //===================================================================//
      // Edit the message in the registration channel to indicate that the applicant has been rejected
      const req = new HttpRequest(`https://discord.com/api/v10/channels/${config.Synchronization.respondChannel}/messages/${interaction.message.id}`)
      req.method = HttpRequestMethod.Patch;
      req.headers = [new HttpHeader("Content-Type", "application/json"), new HttpHeader("Authorization", `Bot ${config.main.botToken}`)];
      req.body = JSON.stringify({
        embeds: [
          {
            author: {
              name: `${interaction.message.embeds[0].author.name} (Rejected)`,
              icon_url: interaction.message.embeds[0].author.icon_url
            },
            description: interaction.message.embeds[0].description,
            color: 0xFF0000,
            footer: {
              text: interaction.message.embeds[0].footer.text
            },
            timestamp: interaction.message.embeds[0].timestamp
          }
        ],
        components: []
      })

      await http.request(req);
      //===================================================================//
      // Remove the applicant from the database
      const index = accounts.findIndex(d => d.id === interaction.message.embeds[0].footer.text.split("ID: ")[1])
      if (index !== -1) {
        accounts.splice(index, 1)
        world.setDynamicProperty("accounts", JSON.stringify(accounts))
      }
      break;
    }
  }
}

function dm(userId, message) {
  const req = new HttpRequest(`https://discord.com/api/v10/users/@me/channels`)
  req.method = HttpRequestMethod.Post;
  req.headers = [new HttpHeader("Content-Type", "application/json"), new HttpHeader("Authorization", `Bot ${config.main.botToken}`)];
  req.body = JSON.stringify({
    recipient_id: userId
  });

  http.request(req).then(res => {
    const dmChannel = JSON.parse(res.body);
    const dmReq = new HttpRequest(`https://discord.com/api/v10/channels/${dmChannel.id}/messages`)
    dmReq.method = HttpRequestMethod.Post;
    dmReq.headers = [new HttpHeader("Content-Type", "application/json"), new HttpHeader("Authorization", `Bot ${config.main.botToken}`)];
    dmReq.body = JSON.stringify(message);

    http.request(dmReq);
  })
}