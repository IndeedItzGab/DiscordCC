# API References
DiscordCC offers api that can be use by other scripts/add-ons depending on their needs or wants. Therefore, this documentation show all possible API frameworks that DiscordCC offers.

You may ask how DiscordCC API framework work, it uses script event to receive calls with specific id and usage. Although it currently doesn't have that much exposed API(s) to use, I will consider implementing much in the near future.

> [!NOTE]
> This document is not certainly finished and not properly formatted. I will consider improving this document in the near future.

## Table Of Content
- [Table Of Content](#table-of-content)
- [Bot method](#bot-method)
- [Webhook method](#webhook-method)

## Bot Method
**Example Usage:**
```javascript
import { system } from "@minecraft/server"
system.sendScriptEvent("discordcc:botSend", JSON.stringify({content: "Hello, world!"}))
```

## Webhook Method
**Example Usage:**
```javascript
import { system } from "@minecraft/server"
system.sendScriptEvent("discordcc:webhookSend", JSON.stringify({username: "DiscordCC", avatar_url: "https://example.com", content: "Hello, world!"}))
```
