import { websocket, http, HttpHeader, HttpRequest, HttpRequestMethod } from "@minecraft/server-net"
import { config } from "../config";
import { world, system } from "@minecraft/server"
import { MessageListener } from "./events/MessageListener.js"
import { PresenceUpdater } from "./live/PresenceUpdater.js";
import { Interaction } from "./modules/Interaction.js";
import { SlashCommand } from "./commands/CommandRegistration.js";

// TAKE NOTE: that some function within this file are from discord.js WebSocket handler so the connection is stable as much as possible.
// This is update should be "resume" friendly without expecting it to fail like it used to be before.
// We'll do lots of experiments

const sleep = (tick) => new Promise(resolve => system.runTimeout(resolve, tick));

// Necessary Variables
export let applicationId, guildId;
export const guilds = new Map()

let client = {
  status: "OFFLINE",
  isOk: false,
  helloHandlerTimeout: null,
  oldGateway: null,
  gateway: null,
  doResume: false,

  lastSequence: null,
  lastSessionID: null,
  resumeUrl: null,
  replayedEvents: 0,

  heartbeat: null,
  lastHeartbeat: -1,
  isAck: true,

  slashRegistered: false
}

const GatewayOpCodes = {
  Dispatch: 0,
  Heartbeat: 1,
  Identify: 2,
  PresenceUpdate: 3,
  VoiceStateUpdate: 4,
  Resume: 6,
  Reconnect: 7,
  RequestGuildMembers: 8,
  InvalidSession: 9,
  Hello: 10,
  HeartbeatAck: 11,
  RequestSoundboardSounds: 31,
  RequestChannelInfo: 43
}

const GatewayCloseCodes = {
  UnknownError: 4000,
  UnknownOpcode: 4001,
  DecodeError: 4002,
  NotAuthenticated: 4003,
  AuthenticationFailed: 4004,
  AlreadyAuthenticated: 4005,
  InvalidSeq: 4007,
  RateLimited: 4008,
  SessionTimedOut: 4009,
  InvalidShard: 4010,
  ShardingRequired: 4011,
  InvalidApiVersion: 4012,
  InvalidIntents: 4013,
  DisallowedIntents: 4014
}

const GatewayDispatchEvents = {
  Ready: "READY",
  Resumed: "RESUMED"
}

system.run(() => {
  if(!config.token || !config.channel) return console.info(`No token or channel id provided.`)
  internalConnect()
})


async function internalConnect() {
  console.info("Internal Connect")
  if(client.gateway && !client.doResume) return; // Avoid multiple sockets connection
  let gateway;
  const url = `${client.resumeUrl ?? "wss://gateway.discord.gg"}/?v=10&encoding=json`
  
  try {
    gateway = await websocket.connect(url)
    client.gateway = gateway
  } catch (err) {
    console.error(err)
    return destroy(false)
  }

  console.info(`Connected to ${url}`)
  webhookHandler()
  gateway.afterEvents.message.subscribe(async (event) => {
    onMessage(JSON.parse(event.message))
  })

  // No-Hello Handler timeout
  client.helloHandlerTimeout = system.runTimeout(() => {
    if(!client.isOk) {
      console.info("We did not received HELLO code")
      gateway.close()
    }
  }, 5*20)

  gateway.afterEvents.close.subscribe(() => {
    console.error("The session destroyed unexpectedly.")
    destroy(false)
  })
}


async function onMessage(packet) {
  switch(packet.op) {
    case GatewayOpCodes.Dispatch: {
      switch(packet.t) {
        case GatewayDispatchEvents.Ready: { 
          debug(1, "Connected to Discord")

          // This save current session information to be use on resuming
          client = {
            ...client,
            status: "READY",
            lastSequence: packet.s,
            lastSessionID: packet.d.session_id,
            resumeUrl: packet.d.resume_gateway_url
          }

          // Some necessary stuff 
          // Slash commands
          const req = new HttpRequest(`https://discord.com/api/v10/channels/${config.channel}`)
          req.method = HttpRequestMethod.Get
          req.headers = [
            new HttpHeader("Content-Type", "application/json"),
            new HttpHeader("Authorization", `Bot ${config.token}`)
          ]

          const res = await http.request(req)
          const body = JSON.parse(res.body)
          guildId = body.guild_id
          applicationId = packet.d.application.id
          PresenceUpdater(client.gateway)

          // Register slash commands
          if(!client.slashRegistered) {
            SlashCommand.init()
            client.slashRegistered = true
          }
          break;
        }
        case GatewayDispatchEvents.Resumed: {
          client = {
            ...client,
            status: "READY"
          }
          break;
        }
        case "MESSAGE_CREATE": {
          MessageListener(packet.d)
          break;
        }
        case "INTERACTION_CREATE": {
          SlashCommand.execute(packet)
          break;
        }
        case "GUILD_CREATE": {
          guilds.set(packet.d.id, packet.d)
          break;
        }
      }

      if(packet.s > client.lastSequence) {
        client.lastSequence = packet.s
      }
      break;
    }
    case GatewayOpCodes.Heartbeat: {
      await heartbeat(true)
      break;
    }
    case GatewayOpCodes.Reconnect: {
      await destroy(false) // 
      break;
    }
    case GatewayOpCodes.InvalidSession: {
      debug(2, `Invalid Session: will attempt to resume ${packet.d.toString()}`)
      if(packet.d && client.lastSessionID) {
        await resume()
      } else {
        await destroy()
      }
      break;
    }
    case GatewayOpCodes.Hello: {
      client.isOk = true
      const jitter = Math.random()
      const firstWait = Math.floor((packet.d.heartbeat_interval * jitter) / 50)
      debug(1, `preparing first heartbeat of the connection with a jitter of ${jitter}; waiting ${firstWait}ms`)

      if(client.doResume) {
        resume(client.gateway)
        client.doResume = false
      } else {
        identify(client.gateway)
      }


      await sleep(firstWait)
      await heartbeat()
      
      debug(1, `First heartbeat sent, starting to beat every ${packet.d.heartbeat_interval}ms`)

      client.heartbeat = system.runInterval(() => {
        if(Date.now() - client.lastHeartbeat >= packet.d.heartbeat_interval) {
          heartbeat()
        }
      }, 1)
      break;
    }
    case GatewayOpCodes.HeartbeatAck: {
      client.isAck = true;
      //debug(1, `Heartbeat acknowledge, latency of ${Date.now() - client.lastHeartbeat}ms`)
      break;
    }
  }
}

function destroy(isResume) {
  // Stop and reset the heartbeat
  if(client.heartbeat) {
    system.clearRun(client.heartbeat)
    client.isAck = true
    client.lastHeartbeat = -1
  }

  if(client.helloHandlerTimeout) {
    system.clearRun(client.helloHandlerTimeout)
  }

  if(isResume) {
    client.doResume = true;
    client.oldGateway = client.gateway;
  } else {
    client.lastSequence = null;
    client.lastSessionID = null
    client.resumeUrl = null
    if(client.gateway?.isOpen) {
      client.gateway?.close() // Possible loophole (will be tested)
    }
    client.gateway = null;
  }

  client.isOk = false

  system.runTimeout(() => {
    internalConnect()
  }, isResume ? 1 : 5*20)
}

function identify(gateway) {
  gateway.send(JSON.stringify({
    op: 2,
    d: {
      token: config.token,
      intents: 
        (1 << 0) | // GUILDS
        (1 << 8) | // PRESENCES 
        (1 << 9) | // GUILD_MESSAGES
        (1 << 15) | // MESSAGE_CONTENT
        (1 << 7),  // GUILD_VOICE_STATE

      properties: {
        os: "null",
        browser: "minecraft",
        device: "minecraft"
      }
    },
  }))
}

function resume(gateway) {
  debug(1,
`Resuming Session
- Resume URL: ${client.resumeUrl}
- Session ID: ${client.lastSessionID}
- Sequence: ${client.lastSequence}`)

  client.status = "RESUMING"
  client.replayedEvents = 0

  return gateway.send(JSON.stringify({
    op: 6,
    d: {
      token: config.token,
      session_id: client.lastSessionID,
      seq: client.lastSequence
    },
  }))
}

function heartbeat(requested = false) {
  if(!client.isAck && !requested) {
    debug(2, `Zombie Connection: failed to send heartbeat to discord.`)
    return destroy(true)
  }
  if(client.gateway?.isOpen) {
      client.gateway.send(JSON.stringify({
      op: 1,
      d: client.lastSequence ?? null
    }));
  } else {
    // Clear interval for heartbeat
    if(client.heartbeat) {
      system.clearRun(client.heartbeat)
    }
    return;
  }

  client.lastHeartbeat = Date.now()
  client.isAck = false
}

// Webhook handler
// Creates a webhook for the script to use for players' chats
async function webhookHandler() {
  const savedWebhook = JSON.parse(world.getDynamicProperty("discordcc:webhook") || "{}")
  if(!savedWebhook.id) {
    // Create a webhook that the script will use
    if(!config.channel) return console.error("No channel id was provided")
    const req = new HttpRequest(`https://discord.com/api/v10/channels/${config.channel}/webhooks`)
    req.method = HttpRequestMethod.Post
    req.headers = [
      new HttpHeader("Content-Type", "application/json"),
      new HttpHeader("Authorization", `Bot ${config.token}`)
    ]
    req.body = JSON.stringify({
      name: "Player (DO NOT DELETE)", // Added "(DO NOT DELETE)" incase there are some stubborn people :v
      avatar: config.playerAvatar
    })

    const res = await http.request(req)
    const body = JSON.parse(res.body)
    await world.setDynamicProperty("discordcc:webhook", JSON.stringify({id: body.id, token: body.token, url: body.url}))
  } else {
    // Check if the webhook still exists
    // Just to make sure the webhook still exists cuz if does not, chats from in-game won't transfer to discord channel
    const req = new HttpRequest(`https://discord.com/api/v10/webhooks/${savedWebhook.id}/${savedWebhook.token}`)
    req.method = HttpRequestMethod.Get
    req.headers = [
      new HttpHeader("Content-Type", "application/json")
    ]
    
    const res = await http.request(req)
    if(res.status !== 200) { // If not equal to 200 it means the webhook does not exists. Therefore, we gotta do some re-process
      await world.setDynamicProperty("discordcc:webhook", null)
      webhookHandler() // Recall to make a new webhook since we already cleared "discordcc:webhook"
    }
  }
}

function debug(type = 1, message) {
  if(config.debug) {
    switch(type) {
      case 1: {
        return console.info(message)
      }
      case 2: {
        return console.warn(message)
      }
      case 3: {
        return console.error(message)
      }
    }
  }
}
// Receiving close codes is not currently implemented
// function onClose(code = 0) {
//   switch(code) {
//     case GatewayCloseCodes.UnknownError: {
//       console.error(`An unknown error occured: ${code}`);
//       return destroy(true);
//     }
//     case GatewayCloseCodes.UnknownOpcode: {
//       console.error(`An invalid opcode was sent to Discord.`);
//       return destroy(true);
//     }
//     case GatewayCloseCodes.DecodeError: {
//       return destroy(true)
//     }
//     case GatewayCloseCodes.NotAuthenticated: {
//       console.error(`A request was somehow sent before the identify/resume payload`)
//       return destroy(true)
//     }
//     case GatewayCloseCodes.AuthenticationFailed: {
//       console.error(`Authentication failed`)
//       return destroy(true)
//     }
//     case GatewayCloseCodes.AlreadyAuthenticated: {
//       console.error(`More than one auth payload was sent.`);
//       return destroy(false)
//     }
//     case GatewayCloseCodes.InvalidSeq: {
//       console.error(`An invalid sequence was sent.`)
//       return destroy(false)
//     }
//     case GatewayCloseCodes.RateLimited: {
//       console.error(`The WebSocket rate limit has been hit, this should never happen`)
//       return destroy(false)
//     }
//     case GatewayCloseCodes.SessionTimedOut: {
//       console.error(`Session timed out`)
//       return destroy(true)
//     }
//     case GatewayCloseCodes.InvalidShard: {
//       console.error(`Invalid Shard`)
//       return destroy(false)
//     }
//     case GatewayCloseCodes.ShardingRequired: {
//       console.error(`Sharding is required`)
//       return destroy(false)
//     }
//     case GatewayCloseCodes.InvalidApiVersion: {
//       console.error(`Used an invalid API version`)
//       return;
//     }
//     case GatewayCloseCodes.InvalidIntents: {
//       console.error(`Used invalid intents `)
//       return;
//     }
//     case GatewayCloseCodes.DisallowedIntents: {
//       console.error(`Used disallowed intents`)
//       return;
//     }
//     default: {
//       console.error(`The gateway closed with an unexpected code: ${code}, attempting to idk`)
//       return destroy(false)
//     }
//   }
// }

// async function main() {
//   console.info("TEST")
//   if(client.gateway) return; // Avoid multiple sockets connection
//   let gateway;
  
//   try {
//     gateway = await websocket.connect(`${client.resumeUrl ?? "wss://gateway.discord.gg"}/?v=10&encoding=json`)
//     client.gateway = gateway
//   } catch (err) {
//     debug(3, err)
//     return destroy(false)
//   }



//   gateway.afterEvents.message.subscribe(async (event) => {
//     const packet = JSON.parse(event.message)
    
//     switch(packet.op) {
//       case 10: // HELLO code handler
//         console.info("Connecting to discord")
//         client.isOk = true;

//         // Client's Heartbeat
//         client.heartbeat = system.runInterval(() => {
//           if(Date.now() - client.lastHeartbeat >= packet.d.heartbeat_interval) {
//             console.info("SENT")
//             heartbeat()
//           }
//         }, 1);

//         if(client.doResume && client.lastSequence !== null && client.lastSessionID) {
//           resume(gateway)
//           client.doResume = false
//         } else {
//           identify(gateway)
//         }
//         break;
//       case 1: // Heartbeat requested
//         heartbeat(true)
//         break;
//       case 7: // Reconnect and resume
//         console.info("Reconnecting code received")
//         destroy(true)
//         break;
//       case 9: // Invalid session
//         console.info("Invalidated session code received")
//         destroy(packet.d)
//         break;
//       case 11: // Heartbeat Ack
//         client.isAck = true
//         break;
//       case 0: // Event dispatch
//         console.info(packet.t)
//         client.lastSequence = packet.s
//         switch(packet.t) {
//           case "READY":
//             console.info("Connected to discord")
//             applicationId = packet.d.application.id
//             client.lastSessionID = packet.d.session_id
//             client.resumeUrl = packet.d.resume_gateway_url

//             !client.slashRegistered ? registerSlashCommands() : null
//             client.slashRegistered = true
//             PresenceUpdater(gateway)
//             // // Suicide code
//             // gateway.send(JSON.stringify({
//             //   op: 7,
//             //   d: null
//             // }))
//             break;
//           case "MESSAGE_CREATE":
//             MessageListener(packet.d)
//             break;
//           case "INTERACTION_CREATE":
//             execute(packet.d.data.name, new Interaction(packet.d))
//             break;
//           case "RESUMED":
//             if(client.oldGateway) {
//               client.oldGateway.close()
//               client.oldGateway = null
//             }
//             break;
//         }
//         break;
//     }


//   })

//   // No-Hello Handler timeout
//   client.helloHandlerTimeout = system.runTimeout(() => {
//     if(!client.isOk) {
//       debug(2, "We did not received HELLO code")
//       destroy(false)
//     }
//   }, 5*20)

//   gateway.afterEvents.close.subscribe(() => {
//     debug(3, "The session destroyed unexpectedly.")
//     destroy(false)
//   })
// }
