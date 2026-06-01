import * as net from "@minecraft/server-net"
import { world, system } from "@minecraft/server"
import { config } from "../config.js"
import { MessageListener } from "./events/MessageListener.js"
import { PresenceUpdater } from "./live/PresenceUpdater.js";
import { execute } from "./commands/CommandRegistration.js";
import { Interaction } from "./modules/Interaction.js";
import { registerSlashCommands } from "./commands/CommandRegistration.js";


// Everything here will be refactored for improvements
// The current code is just for testing and will be improved in the future updates

// KNOWN ISSUE or sum
// Heartbeat jitter not implemented
// Resume not working properly


export let applicationId;
let file = {
  // Heartbeat things
  heartbeat: null,
  heartbeatAck: true,
  lastHeartbeat: 0,

  // Resume things
  sessionId: null,
  seq: null,
  resumeGatewayUrl: null,
  resumeMode: false,

  connected: null,
  reconnecting: false,
  slashRegistered: false,
  gateway: null,
  isHello: false
}

let debugNum = 0

function start() {
  if(file.connected || !config.token || !config.channel) return;
  file.connected = true
  
  system.run(async () => {
    
    
    let gateway;
    try {
      gateway = await net.websocket.connect(`${file.resumeGatewayUrl ?? "wss://gateway.discord.gg"}/?v=10&encoding=json`)
      file.gateway = gateway;
    } catch (err) {
      console.error(err)
      return reconnect("restart");
    }
    gateway.afterEvents.message.subscribe(async (event) => {
      // Declaring Variables
      const packet = JSON.parse(event.message) 
      const { op, t, d } = packet;
      // DEBUGGING AREA ======================================
      // if(![0, 10, 11].includes(op)) {
      //   console.error(`OP different received: ${op}`)
      // }
      // t ? console.log(t) : null;
      // =====================================================

      switch(op) {
        case 1: // Immidiate heartbeat request from discord
          console.info("Discord requested heartbeat");
          heartbeat(true)
          break;
        case 10: // HELLO code

          file.isHello = true
          console.info("Connecting to discord server..")
          
          // Client's Heartbeat
          file.heartbeat = system.runInterval(() => {
            if(Date.now() - file.lastHeartbeat >= d.heartbeat_interval) {
              heartbeat()
            }
          }, 1);

          if(file.resumeMode && file.sessionId && file.seq) {
            // For some particular reason I couldn't properly resume the previous session as it always causes op 9 or invalid session afterward.
            // I should focus on solving this minor issue for a while.
  //           console.log(`
  // resumeMode: ${file.resumeMode},
  // Session ID: ${file.sessionId},
  // Sequence: ${file.seq},
  // resume url: ${file.resumeGatewayUrl}`)
            
            system.runTimeout(() => {
              gateway.send(JSON.stringify({
                op: 6,
                d: {
                  token: config.token,
                  session_id: file.sessionId,
                  seq: file.seq
                },
              }));
            }, 20)
            file.resumeMode = false
          } else {
            gateway.send(JSON.stringify({
              op: 2,
              d: {
                token: config.token,
                intents: 33281,
                properties: {
                  os: "null",
                  browser: "minecraft",
                  device: "minecraft"
                }
              },
            }));
          }
          break;
        case 7: // Discord requesting to reconnect and resume the previous connection
          reconnect("resume")
          break;
        case 9: // The session was invalid. Therefore, we should restart everything.
          console.error("Discord session was invalid.. reconnecting..")
          reconnect(d ? "resume" : "restart")
          break;
        case 11: // Sent in response to receiving a heartbeat to acknowledge that it has been received.
          file.heartbeatAck = true
          break;
        case 0: // An event was dispatched.
          file.seq = packet.s
          switch(t) {
            case "READY":
              console.info(`Discord connected successfully.`);
              applicationId = d.application.id;
              file.sessionId = d.session_id;
              file.resumeGatewayUrl = d.resume_gateway_url;
              file.resumeMode = false;
              !file.slashRegistered ? registerSlashCommands() : null
              file.slashRegistered = true
              PresenceUpdater(gateway)
              break;
            case "MESSAGE_CREATE":
              MessageListener(d)
              break;
            case "INTERACTION_CREATE":
              execute(d.data.name, new Interaction(d))
              break;
          }
          break;
      }
    })

    // A backup system incase we did not received "HELLO" op code from Discord Gateway
    system.runTimeout(() => {
      if(!file.isHello) {
        console.warn("Discord did not sent '1' op code ")
        reconnect("restart")
      }
    },5*20)

    // Reconnect to Discord bot if websocket close itself unexpectedly.
    // For some reason this event doesn't return any "reason" or error code so it's kinda hard to identify how it closed unexpectedly. 
    gateway.afterEvents.close.subscribe(() => {
      console.warn("The websocket was closed unexpectedly.")
      reconnect("restart")
    })
  })
}

start() // Initial starting point

function reconnect(type) {
  if(file.reconnecting) return
  file.reconnecting = true;
  file.connected = false //*
  file.heartbeat ? system.clearRun(file.heartbeat) : null; //*
  file.heartbeat = null;  //*
  file.heartbeatAck = true //*
  file.lastHeartbeat = 0 //*
  file.isHello = false; 
  file.gateway.isOpen ? file.gateway.close() : null
  file.gateway = null

  switch(type) {
    case "restart":
      console.info("Discord connection restarting..")
      file.seq = null
      file.sessionId = null
      file.resumeMode = false
      file.resumeGatewayUrl = null
      break;
    case "resume":
      console.info("Discord connection resuming..")
      file.resumeMode = true
      break;
  }

  system.runTimeout(() => {
    file.reconnecting = false;
    start()
  }, type === "restart" ? 5*20 : 1)
}

function heartbeat(requested = false) {
  if(!file.heartbeatAck && !requested) {
    console.error(`Zombie Connection: failed to send heartbeat to discord.`)
    return reconnect("resume")
  }

  file.gateway.send(JSON.stringify({
    op: 1,
    d: file.seq ?? null
  }));

  file.lastHeartbeat = Date.now()
  file.heartbeatAck = false
}