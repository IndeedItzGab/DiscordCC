import { http, HttpRequest, HttpHeader, HttpRequestMethod } from "@minecraft/server-net"

export class Interaction {
  constructor(d) {
    this.id = d.id;
    this.token = d.token;
    this.member = d.member;
    this.member.user.avatarUrl = `https://cdn.discordapp.com/avatars/${d.member.user.id}/${d.member.user.avatar}.png`
    switch(d.type) {
      case 2: { // Slash Commands
        this.guild = d.guild
        this.options = {
          sub: d.data?.options?.[0] ?? null,
          getSubString(name) {
            return d.data.options[0].options.find(d => d.name === name)?.value
          },
          getString(name) {
            return d.data.options.find(d => d.name === name)?.value
          },
          getUser(name) {
            return d.data.resolved.users[d.data.options.find(d => d.name === name)?.value]
          }
        }
        break;
      }
      case 3: { // Message Components
        this.data = d.data;
        this.message = d.message;
        break;
      }
    }
    
    
  
    
  }

  async reply(data) {
    const req = new HttpRequest(`https://discord.com/api/v10/interactions/${this.id}/${this.token}/callback`);
    req.method = HttpRequestMethod.Post;
    req.headers = [new HttpHeader("Content-Type", "application/json")];
    req.body = JSON.stringify({
      type: 4,
      data: data
    });
  
    await http.request(req);
  }
}