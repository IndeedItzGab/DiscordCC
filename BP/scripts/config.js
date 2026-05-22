// Make sure you read the official installation.
// This doesn't suppot client-side or realms.

// Video Tutorial: <SOON>
// Instructions (HOW TO USE): https://github.com/IndeedItzGab/DiscordCC/blob/main/docs/INSTALLATION.md#installation

export const config = {
  token: "", // The discord bot token.
  channel: "", // Channel ID for players from the server and people in discord server to chat on.
  webhook: "", // The webhook url of the same channel for the script to send a message from server to discord.

  // Identification
  moderatorRoles: [""], // A role ID that is used to identify moderators allowing them to use slash commands for moderators.

  // Extra Configuration - You can tweak these setting from your own preference.
  playerAvatar: "https://raw.githubusercontent.com/IndeedItzGab/DiscordCC/refs/heads/main/docs/images/steve.jpg",
  discordMessageFormat: "§7[§bDiscord§7] §3$user§7:§r $message",
  discordReplyToMessageFormat: "§7[§bDiscord§7] §3$user §7replying to §3$replyUser§7:§r $message",

  // Events Handler
  discordChat: true, // Allow users from discord to send their messages to the game.
  gameChat: true, // Allow players from the server to send their messages to the discord channel.
  deathNotification: true, // Send a death notification to the specified discord channel.
  joinNotification: true, // Send a join notification to the specified discord channel.
  leftNotification: true, // Send a left notification to the specified discord channel.
  shutdownNotification: true, // send a server stopped or shutdown notification to the specified discord channel.
  startedNotification: true // send a server started notification to the specified discord channel.
}