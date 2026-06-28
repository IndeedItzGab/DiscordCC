// Make sure you read the official installation.
// This doesn't suppot client-side or realms.

// Video Tutorial: <SOON>
// Instructions (HOW TO USE): https://github.com/IndeedItzGab/DiscordCC/blob/main/docs/INSTALLATION.md#installation

export const config = {
  // Main Configuration - You can tweak these setting from your own preference.
  /*
    The main configuration section allows you to customize the core settings of the system, including the bot token, relay channel, and moderator roles. These settings are essential for the proper functioning of the system and should be configured according to your server's requirements.
    The bot token is used to authenticate the bot with the Discord API, allowing it to interact with Discord servers and perform actions on behalf of the bot.
    The relay channel is the designated channel where messages from the server will be relayed to Discord and vice versa, enabling seamless communication between the two platforms.
    Moderator roles are used to identify users with elevated permissions, allowing them to access moderator-specific commands and features within the system.
  */
  main: {
    botToken: "", // The discord bot token.
    relayChannel: "", // The channel ID that the bot will relay messages from the server to discord and vice versa.
    moderatorRoles: [""], // A role ID that is used to identify moderators allowing them to use slash commands for moderators.  
  },

  // Synchronization Configuration - You can tweak these setting from your own preference.
  // TODO: Discord Application Form (Customizable) - This feature will be implemented in the future update.
  // TODO: Customizable Messages - This feature will be implemented in the future update.
  // ! NOTICE: This feature may receive a breaking and constant updates, please be alert.
  /*
    Synchronization is the process of linking a user's Discord account to their Minecraft account. This allows for better integration between the two platforms, enabling features such as chat synchronization, gamertag registration, and more.
    The synchronization process typically involves the following steps:
    1. A user initiates the synchronization process by providing their Discord account information through a bot command.
    2. If the provided information is valid, the system links the user's Discord account to their Minecraft account, creating a connection between the two platforms.
    3.1 If the "autoAccept" option is enabled, the system will automatically approve the gamertag registration request. Then, the user will verify the connection with /verify command. Once verified, the gamertag will be registered and linked to the user's Discord account.
    3.2 If the "autoAccept" option is disabled, the system will require a moderator to approve the gamertag registration request.
    4. Once the accounts are linked, the system can synchronize data between the two platforms, such as chat messages, gamertag information, and other relevant data.

    Note:
      - Synchronization is not connected with whitelist system of minecraft bedrock. It has separate list of data.
      - The specific implementation of synchronization may vary depending on the server setup and the features provided by the Discord bot being used.
      - This feature will continue to receive updates and improvements in the future, so make sure to check for updates regularly.
  */
  
  Synchronization: {
    enable: false, // Enable or disable the synchronization feature. If enable player who has not linked their discord account to their gamertag will not be able to join the server.
    autoAccept: false, // Automatically accept a gamertag registration request without the need of a moderator to approve it.
    roleToAdd: "", // [OPTIONAL] The role ID that will be provided for discord users who got their gamertag connection accepted by moderators or automatically.
    respondChannel: "", // [REQUIRED IF "AUTOACCEPT" IS DISABLED] The channel ID that the bot will respond to when a user registers their gamertag. (This is where the bot will send the registration request to moderators.)
  },

  // Extra Configuration - You can tweak these setting from your own preference.
  /*
    The extra configuration section provides additional settings that can be customized to enhance the user experience and provide relevant information to users. These settings include the commands namespace, debug mode, server name, server address, server port, Discord invite link, message formats, and notification settings.
    The commands namespace is a unique identifier for the custom slash commands used by the bot, ensuring that they do not conflict with other slash commands.
    Debug mode enables logging of all information about the Discord client, which can be useful for troubleshooting and monitoring the bot's activity.
    The server name, address, and port provide users with information about the Minecraft server they are connecting to, allowing them to easily identify and join the server.
    The Discord invite link allows users to join the Discord server associated with the bot, providing a community space for users to interact and communicate.
    The message formats allow customization of how messages are displayed in both Minecraft and Discord, ensuring that they are clear and easy to read.
    The notification settings allow customization of how notifications are sent to users, enabling them to stay informed about important events and actions within the system.
  */
  commandsNamespace: `discordcc`, // A unique minecraft custom slash command identifier
  debug: false, // Logs all information about the discord client.
  serverName: "", // Provde a name for your minecraft bedrock server
  serverAddress: "", // Provide a server address to your minecraft bedrock server for users to view
  serverPort: "", // Provide a server port to your minecraft bedrock server for users to view
  discordInviteLink: "",
  discordMessageFormat: "§7[ §9Discord§7] $user§7:§r $message",
  discordReplyToMessageFormat: "§7[ §9Discord§7] $user §7replying to §3$replyUser§7:§r $message",

  // Notifications Configuration - You can tweak these setting from your own preference.
  /*
    Notifications are messages or alerts that are sent to users to inform them about specific events or actions. The purpose of notifications is to keep users informed and engaged with the system, providing them with relevant information in a timely manner.
    The notifications configuration allows you to customize the behavior and settings of these notifications, enabling you to control how and when they are sent to users. This can include options for enabling or disabling specific types of notifications, choosing the channels through which they are sent, and configuring the content and format of the messages.
  */
  alerts: {
    discordChat: true, // Allow users from discord to send their messages to the game.
    gameChat: true, // Allow players from the server to send their messages to the discord channel.
    deathNotification: true, // Send a death notification to the specified discord channel.
    joinNotification: true, // Send a join notification to the specified discord channel.
    leftNotification: true, // Send a left notification to the specified discord channel.
    shutdownNotification: true, // send a server stopped or shutdown notification to the specified discord channel.
    startedNotification: true // send a server started notification to the specified discord channel.
  }
}