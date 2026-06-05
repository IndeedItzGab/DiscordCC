import { http, HttpRequest, HttpHeader, HttpRequestMethod } from "@minecraft/server-net"

export class Interaction {
  constructor(d) {
    this.id = d.id;
    this.token = d.token;
    this.member = d.member
    
    this.options = {
      sub: d.data?.options?.[0] ?? null,
      getSubString(name) {
        return d.data.options[0].options.find(d => d.name === name)?.value
      },
      getString(name) {
        return d.data.options.find(d => d.name === name)?.value
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