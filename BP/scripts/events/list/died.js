import { world } from "@minecraft/server"
import { http, HttpRequest, HttpHeader, HttpRequestMethod} from "@minecraft/server-net"
import { config } from "../../config.js"
import { captureOwnerStack } from "react";

world.afterEvents.entityDie.subscribe(event => {
  if(!config.token || !config.channel) return;
  if(event.deadEntity.typeId !== "minecraft:player") return;
  

  const cause = event.damageSource

  let message;
  switch(cause.cause) {
    case "anvil":
      message = `${event.deadEntity.name} was squashed by a falling anvil`
      break;
    case "blockExplosion":
      message = `${event.deadEntity.name} blew up`
      break;
    case "campfire":
      message = `${event.deadEntity.name} went up in flames`
      break;
    case "contact":
      if(cause.damagingEntity) {
        message = `${event.deadEntity.name} was slain by ${cause.damagingEntity?.typeId.split(':').slice(1).join(" ").split("_")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}`
        
      } else {
        message = `${event.deadEntity.name} was pricked to death`
      }  
      break;
    case "drowning":
      message = `${event.deadEntity.name} drowned`
      break;
    case "entityAttack":
      message = `${event.deadEntity.name} was slain by ${cause.damagingEntity?.typeId.split(':').slice(1).join(" ").split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")}`
      break;
    case "entityExplosion":
      if(cause.damagingEntity?.typeId === "minecraft:tnt") {
        message = `${event.deadEntity.name} was blown up by Block of TNT`
      } else {
          message = `${event.deadEntity.name} was blown up by ${cause.damagingEntity?.typeId.split(':').slice(1).join(" ").split("_")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}`
      }
      break;
    case "fall":
      message = `${event.deadEntity.name} fell from a high place`
      break;
    case "fallingBlock":
      message = `${event.deadEntity.name} was squashed by a falling block`
      break;
    case "fire":
      message = `${event.deadEntity.name} went up in flames`
      break;
    case "fireTick":
      message = `${event.deadEntity.name} burned to death`
      break;
    case "fireworks":
      message = `${event.deadEntity.name} went off with a bang`
      break;
    case "flyIntoWall":
      message = `${event.deadEntity.name} experienced kinetic energy`
      break;
    case "freezing":
      message = `${event.deadEntity.name} froze to death`
      break;
    case "lava":
      message = `${event.deadEntity.name} tried to swim in lava`
      break;
    case "lightning":
      message = `${event.deadEntity.name} was struck by lightning`
      break;
    case "maceSmash":
       message = `${event.deadEntity.name} was smashed by ${cause.damagingEntity?.typeId.split(':').slice(1).join(" ").split("_")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}`
      break;
    case "magic":
      if(cause.damagingEntity) {
        message `${event.deadEntity.name} was killed by ${cause.damagingEntity?.typeId.split(':').slice(1).join(" ").split("_")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")} using magic`
      } else {
        message = `${event.deadEntity.name} was killed by magic`
      }
      break;
    case "magma":
      message = `${event.deadEntity.name} discovered floor was lava`
      break;
    case "none":
      message = `${event.deadEntity.name} died`
      break;
    case "override":
      message = `${event.deadEntity.name} died`
      break;
    case "projectile":
      if(!cause.damagingEntity && cause.damagingProjectile?.typeId === "minecraft:arrow") {
        message = `${event.deadEntity.name} was slain by Arrow`
      } else if(cause.damagingEntity && cause.damagingProjectile?.typeId === "minecraft:arrow") {
        message = `${event.deadEntity.name} was shot by ${cause.damagingEntity.typeId.split(':').slice(1).join(" ").split("_")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}`

      }
      break;
    case "selfDestruct":
      message = `${event.deadEntity.name} died`
      break;
    case "sonicBoom":
      message = `${event.deadEntity.name} was obliterated by a sonically-charged shriek whilst trying to escape ${cause.damagingEntity.typeId.split(':').slice(1).join(" ").split("_")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}`
      break;
    case "soulCampfire":
      message = `${event.deadEntity.name} went up in flames`
      break;
    case "stalactite":
      message = `${event.deadEntity.name} was skewered by a falling stalactite`
      break;
    case "stalagmite":
      message = `${event.deadEntity.name} was impaled on a stalagmite`
      break;
    case "starve":
      message = `${event.deadEntity.name} starved to death`
      break;
    case "suffocation":
      message = `${event.deadEntity.name} suffocated in a wall`
      break;
    case "thorns":
      message = `${event.deadEntity.name} was killed trying to hurt ${cause.damagingEntity?.name}`
      break;
    case "void":
      message = `${event.deadEntity.name} fell out of the world`
      break;
    case "wither":
      message = `${event.deadEntity.name} withered away`
      break;
    default:
      message = `${event.deadEntity.name} died`
      break;
  }

  const res2 = new HttpRequest(config.webhook)
  res2.method = HttpRequestMethod.Post
  res2.headers = [
    new HttpHeader("Content-Type", `application/json`)
  ]
  res2.body = JSON.stringify({
    embeds: [
      {
        author: {
          name: message,
          icon_url: "https://cdn.discordapp.com/attachments/1136508489989111901/1383302370489794772/54f4b55a59ff9ddf2a2655c7f35e4356.jpg?ex=684e4c39&is=684cfab9&hm=e5da707d1ba28406db35d8f3c03db56beeed9b644908d5a54f3f9323213d1bdc&"
        },
        color: 0x000000
      }  
    ],
    username: "Newb SMP",
    avatar_url: "https://cdn.discordapp.com/attachments/1136508489989111901/1383287918004801626/ezgif.com-video-to-gif-1.gif?ex=684e3ec3&is=684ced43&hm=bac37521c5461e837dd8e53d56bdf99d107d86e1a505f7015c77d6400d70b67a&"
  })
  
  http.request(res2)
})