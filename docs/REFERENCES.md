# API References
DiscordCC offers api that can be use by other scripts/add-ons depending on their needs or wants. Therefore, this documentation show all possible API frameworks that DiscordCC offers.

You may ask how DiscordCC API work, it use script evemt to

## Table Of Content
-  [Table Of Content](#table-of-content)
-  [Message](#message)
-  [Embed Object](#embed-object)
  -  [footer](#footer)
-  [sendChat](#sendchat)

## Message
Represents a sent in a channel within Discord
|FIELD     |TYPE                  |Description                                                |
|----------|----------------------|-----------------------------------------------------------|
|content   |string                |contents of the message                                    |
|embed     |[embed](#embed-object) object|embedded content                                           |

## Embed Object
**Embed Structure**
|FIELD      |TYPE                       |Description                                                         |
|-----------|---------------------------|--------------------------------------------------------------------|
|title      |string                     |contents of the message                                             |
|description|string                     |embedded content                                                    |
|footer     |[footer](#footer) object   |footer information                                                  |
|color      |integer                    |color code of the embed                                             |
|thumbnail  |string                     |source url of thumbnail (only supports http(s) and attachments)     |
|timestamp  |boolean                    |timestamp of embed content                                          |

### footer
**Embed Footer Structure**
|FIELD      |TYPE                       |Description                                                         |
|-----------|---------------------------|--------------------------------------------------------------------|
|text       |string                     |footer text                                                         |
|iconUrl    |string                     |url of footer icon (only supports http(s) and attachments)          |


## sendChat
This api allows a script to send a message to the specified discord channel.
|FIELD     |TYPE       |Description                                                        |
|----------|-----------|-------------------------------------------------------------------|
|username  |string     |override the default username of the webhook                       |
|avatarUrl |string     |source url of image (only supports http(s) and attachments)        |
|message   |string     |Represents a [message](#message) sent in a channel within Discord  |

**Example Usage:**
```javascript
import { system } from @minecraft/server
system.sendScriptEvent("discordcc:sendChat", JSON.stringify({message: {content: message}, username: player.name}))
```