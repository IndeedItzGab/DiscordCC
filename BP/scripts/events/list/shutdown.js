import { system } from "@minecraft/server"
import { http, HttpRequest, HttpHeader, HttpRequestMethod} from "@minecraft/server-net"
import { config } from "../../config.js"

system.beforeEvents.shutdown.subscribe(event => {
  if(!config.token || !config.channel) return;
  const res2 = new HttpRequest(config.webhook)
  res2.method = HttpRequestMethod.Post
  res2.headers = [
    new HttpHeader("Content-Type", `application/json`)
  ]
  res2.body = JSON.stringify({
    content: "🛑**Server has stopped**"
  })
  
  http.request(res2)
})