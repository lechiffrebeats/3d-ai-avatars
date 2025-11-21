/** @type {import('./$types').RequestHandler} */
import {SERVER_API_KEY } from "$env/static/private";
import { server_exhausted } from "$lib/General";
import { CURR_API_SERVER } from "../Misc";

export async function POST({ request, fetch }) {
  const form = await request.formData(); // audio + janbg
  const upstream = await fetch(`${CURR_API_SERVER}/stt/transcribe`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVER_API_KEY}`,
    },
    body: form,
  });

  const body = await upstream.text();

  if (!upstream.ok) {
    server_exhausted.set(true);
    return new Response(body, {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") ?? "application/json",
      },
    });
  }
  
  server_exhausted.set(false);
  return new Response(body, {
    status: upstream.status,
    headers: {
      "Content-Type":
        upstream.headers.get("content-type") ?? "application/json",
    },
  });
}



