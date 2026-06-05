import { world } from "@minecraft/server"
import { config } from "../../config.js"
import { botSend } from "../../utilities/botSend.js";

world.afterEvents.entityDie.subscribe(event => {
  if(!config.token || !config.channel || !config.deathNotification) return;
  if(event.deadEntity.typeId === "minecraft:player" || event.deadEntity.getComponent("minecraft:is_tamed") || event.deadEntity.nameTag) {
     const cause = event.damageSource

    let message;
    const killer = cause.damagingEntity?.name || cause.damagingEntity?.typeId.split(':').slice(1).join(" ").split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
    const victim = event.deadEntity.name || event.deadEntity.nameTag || event.deadEntity.typeId.split(':').slice(1).join(" ").split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
    switch(cause.cause) {
      case "anvil":
        message = `${victim} was squashed by a falling anvil`
        break;
      case "blockExplosion":
        message = `${victim} blew up`
        break;
      case "campfire":
        message = `${victim} went up in flames`
        break;
      case "contact":
        if(cause.damagingEntity) {
          message = `${victim} was slain by ${killer}`
          
        } else {
          message = `${victim} was pricked to death`
        }  
        break;
      case "drowning":
        message = `${victim} drowned`
        break;
      case "entityAttack":
        message = `${victim} was slain by ${killer}`
        break;
      case "entityExplosion":
        if(cause.damagingEntity?.typeId === "minecraft:tnt") {
          message = `${victim} was blown up by Block of TNT`
        } else {
            message = `${victim} was blown up by ${killer}`
        }
        break;
      case "fall":
        message = `${victim} fell from a high place`
        break;
      case "fallingBlock":
        message = `${victim} was squashed by a falling block`
        break;
      case "fire":
        message = `${victim} went up in flames`
        break;
      case "fireTick":
        message = `${victim} burned to death`
        break;
      case "fireworks":
        message = `${victim} went off with a bang`
        break;
      case "flyIntoWall":
        message = `${victim} experienced kinetic energy`
        break;
      case "freezing":
        message = `${victim} froze to death`
        break;
      case "lava":
        message = `${victim} tried to swim in lava`
        break;
      case "lightning":
        message = `${victim} was struck by lightning`
        break;
      case "maceSmash":
        message = `${victim} was smashed by ${killer}`
        break;
      case "magic":
        if(cause.damagingEntity) {
          message `${victim} was killed by ${killer} using magic`
        } else {
          message = `${victim} was killed by magic`
        }
        break;
      case "magma":
        message = `${victim} discovered floor was lava`
        break;
      case "none":
        message = `${victim} died`
        break;
      case "override":
        message = `${victim} died`
        break;
      case "projectile":
        if(!cause.damagingEntity && cause.damagingProjectile?.typeId === "minecraft:arrow") {
          message = `${victim} was slain by Arrow`
        } else if(cause.damagingEntity && cause.damagingProjectile?.typeId === "minecraft:arrow") {
          message = `${victim} was shot by ${killer}`

        }
        break;
      case "selfDestruct":
        message = `${victim} died`
        break;
      case "sonicBoom":
        message = `${victim} was obliterated by a sonically-charged shriek whilst trying to escape ${killer}`
        break;
      case "soulCampfire":
        message = `${victim} went up in flames`
        break;
      case "stalactite":
        message = `${victim} was skewered by a falling stalactite`
        break;
      case "stalagmite":
        message = `${victim} was impaled on a stalagmite`
        break;
      case "starve":
        message = `${victim} starved to death`
        break;
      case "suffocation":
        message = `${victim} suffocated in a wall`
        break;
      case "thorns":
        message = `${victim} was killed trying to hurt ${killer}`
        break;
      case "void":
        message = `${victim} fell out of the world`
        break;
      case "wither":
        message = `${victim} withered away`
        break;
      default:
        message = `${victim} died`
        break;
    }

    botSend({
      embeds: [
        {
          author: {
          name: message,
          icon_url: config.playerAvatar
        },
        color: 0x000000
        }
      ]
    })
  }
})