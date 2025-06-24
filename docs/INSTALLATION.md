# Installation
Note that this script only support **Bedrock Dedicated Server**.

### Method 1: Native Installation
1.) Install the script from [CurseForge](https://www.curseforge.com/minecraft-bedrock/addons/discordcc)

2.) Upload the script in the `development_behavior_packs` folder at your server files. Make sure it is decompresses into a folder.

3.) Add the "@minecraft/server-net" in the `config/default/permission.json`. The file content must look like this:
```json
{
  "allowed_modules": [
    "@minecraft/server-gametest",
    "@minecraft/server",
    "@minecraft/server-ui",
    "@minecraft/server-admin",
    "@minecraft/server-editor",
    "@minecraft/server-net"
  ]
}
```
4.) Make sure that the **BETA APIs** is enabled in your world's experimental setting.

5.) You must create a discord bot application from [Discord Development Portal](https://discord.com/developers/applications). After creating one, you must get the token and put it inside the `config.js` at the script folder files

6.) Now, you must copy the channel id of on where you want people to have a chat with then paste the id on the configuration file of the script.

7.) After that, create a webhook at the same discord server channel and name it whatever you want. Then, copy the url and paste it at the configuration file of the script.

8.) You can now play with DiscordCC, if you found a problem. Please contact me.
