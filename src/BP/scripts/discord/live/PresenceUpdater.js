

export async function PresenceUpdater(gateway) {
  if (!gateway?.isOpen) return;
  gateway.send(JSON.stringify({
    op: 3,
    d: {
      since: null,
      activities: [{
        name: `Minecraft: Bedrock Edition server`,
        type: 3
      }],
      status: "online",
      afk: false,
    }
  }))
}