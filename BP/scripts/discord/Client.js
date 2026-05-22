import * as net from "@minecraft/server-net"
import { world, system } from "@minecraft/server"
import { config } from "../config.js"
import { MessageListener } from "./events/MessageListener.js"
import { PresenceUpdater } from "./live/PresenceUpdater.js";
import { execute } from "./commands/CommandRegistration.js";
import { Interaction } from "./modules/Interaction.js";
import { registerSlashCommands } from "./commands/CommandRegistration.js";

export let applicationId;
let heartbeat, sessionId, seq, connected;

function start() {
  if(connected || !config.token || !config.channel) return;
  connected = true
  system.run(async () => {
    const gateway = await net.websocket.connect("wss://gateway.discord.gg/?v=10&encoding=json")

    gateway.afterEvents.message.subscribe(async (event) => {

      const packet = JSON.parse(event.message) 
      const { op, t, d } = packet;
      seq = packet.s


      if(![0, 10, 11].includes(op)) {
        console.error(`OP different received: ${op}`)
      }

      if (op === 10) {
        console.info("Connecting to discord server..")
        
        // Heartbeat
        heartbeat = system.runInterval(() => {
          gateway.send(JSON.stringify({
            op: 1,
            d: null
          }));
        }, Math.floor(d.heartbeat_interval / 50));

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
      } else if(op === 7) {
        console.error("Session resuming..")
        gateway.send(JSON.stringify({
          op: 6,
          d: {
            token: config.token,
            session_id: sessionId,
            seq: seq
          },
        }));
      } else if (op === 9) {
        console.error("Discord session was invalid.. reconnecting..")
        heartbeat ? system.clearRun(heartbeat) : null;
        heartbeat = null;
        connected = false
        start()
      }

      // Ready detector
      if (t === "READY") {
        console.info(`Discord connected successfully.`);
        applicationId = d.application.id
        registerSlashCommands()
        PresenceUpdater(gateway)
      } 

      
      // Event Listener
      switch(t) {
        case "MESSAGE_CREATE":
          MessageListener(d)
          break;
        case "INTERACTION_CREATE":
          execute(d.data.name, new Interaction(d))
          break;
      }
    })

    // Reconnect to Discord bot if websocket close itself unexpectedly.
    gateway.afterEvents.close.subscribe((event) => {
      console.info("Reconnecting..")
      heartbeat ? system.clearRun(heartbeat) : null;
      heartbeat = null;
      connected = false
      start()
    })
  })
}
start()