import { system } from "@minecraft/server"
import { http, HttpRequest, HttpHeader, HttpRequestMethod} from "@minecraft/server-net"
import { config } from "../../config.js"

system.beforeEvents.startup.subscribe(event => {
  if(!config.token || !config.channel) return;
  system.run(() => {
    const res2 = new HttpRequest(config.webhook)
    res2.method = HttpRequestMethod.Post
    res2.headers = [
      new HttpHeader("Content-Type", `application/json`)
    ]
    res2.body = JSON.stringify({
      content: "✅**Server has started**"
    })
    
    http.request(res2)
  })
})