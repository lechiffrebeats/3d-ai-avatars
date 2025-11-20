/** @type {import('./$types').RequestHandler} */
import {VM_API_KEY} from "$env/static/private";
import { server_exhausted } from "$lib/General";
import { CURR_API_SERVER } from "../Misc";
export async function POST({ request }) {
  const fullRequest = await request.json();
  console.log("Chat Proxy: ", fullRequest);
  
  try {
    const reply = await fetch(`${CURR_API_SERVER}/gwdg/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${VM_API_KEY}`, },
      body: JSON.stringify(fullRequest),
    });  
    
    if (!reply.ok) {
      server_exhausted.set(true);
      const detail = await reply.text();
      throw new Error(`TTS HTTP ${reply.status}: ${detail}`);
    }
    const fullResponse = await reply.json();

    return new Response(JSON.stringify(fullResponse), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("LLM error:", err);
    return new Response(
      JSON.stringify({
        reply:
          "Das waren leider zu viele Anfragen. Gib mir bitte ein Sekunden !",
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}



