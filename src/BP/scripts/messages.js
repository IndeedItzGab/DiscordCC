
export default {
  notAuthorized: "You are not authorized to perform this action.",
  Synchronization: {
    submisisonForm: {
      title: "Gamertag Registration",
      message: "You must register your gamertag with this application form in order for you to join our bedrock dedicated server. Allowing us to monitor and easily identify each users in the server by linking your discord account to your minecaft bedrock account.",
      color: 0x00FFFF
    },
    confirmGamertag: {
      title: "",
      message: "**Connect your Discord account to \"{0}\"?\nOnce the connection is verified, you must wait 72 hours to change your connected gamertag.**",
      color: 0x00FFFF
    },
    alreadyUsedByOtherUser: {
      title: "",
      message: "**That gamertag is already registered by another user.**",
      color: 0xFF0000
    },
    verifiedGamertagDelay: {
      title: '',
      message: "**You have already registered and verified that gamertag. You can change your registered gamertag after {0} day(s).**",
      color: 0xFF0000
    },
    verfiedGamertagAllow: {
      title: '',
      message: "**You have already registered and verified that gamertag. Do you want to change your registered gamertag to {0}?**",
      color: 0x00FFFF
    },
    registered: {
      title: '',
      message: "**{0} gamertag is now connected to your Discord account.**",
      color: 0x00FF00
    },
    notVerifiedChange: {
      title: '',
      message: "**You have already registered {0} but haven't verified yet. Do you want to change your registered gamertag to {1}?**",
      color: 0x00FFFF
    },
    changeGamertag: {
      title: '',
      message: "**Your registered gamertag has been changed to {0}.**",
      color: 0x00FF00
    },
    userNotifier: {
      accepted: {
        title: "Gamertag Registration Accepted",
        message: "**Your gamertag registration has been accepted by a moderator. You may now play on the server using your registered gamertag.**",
        color: 0x00FF00
      },
      rejected: {
        title: "Gamertag Registration Rejected",
        message: "**Your gamertag registration has been rejected by a moderator. Please contact a moderator for more information.**",
        color: 0xFF0000
      }
    }
  }
}