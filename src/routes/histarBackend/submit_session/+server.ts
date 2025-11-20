// src/routes/histarBackend/save_evaluation/+server.ts
import { json, type RequestHandler } from "@sveltejs/kit";
import { dev } from "$app/environment";
import { supabaseClient, incrementCounter } from "$lib/server/supabaseServer";
import { server_exhausted } from "$lib/General";

const RAW_ALLOWED = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://traustdumir.de",
  "https://www.traustdumir.de"
];
/* https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS */
const norm = (o?: string | null) => (o ?? "").replace(/\/+$/, "").toLowerCase();
const ALLOWED = new Set(RAW_ALLOWED.map(norm));
const ALLOW_CREDENTIALS = false;

function cors(originHeader: string | null) {
  const o = norm(originHeader);
  const allowed = dev || !o || ALLOWED.has(o);
  const headers: Record<string, string> = {
    Vary: "Origin",
    "Access-Control-Allow-Origin": allowed ? (o || "*") : "",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Max-Age": "600"
  };
  if (ALLOW_CREDENTIALS && allowed && o) {
    headers["Access-Control-Allow-Credentials"] = "true";
  }
  return { allowed, headers };
}

export const OPTIONS: RequestHandler = async ({ request }) => {
  const { allowed, headers } = cors(request.headers.get("origin"));
  return new Response(null, { status: allowed ? 204 : 403, headers });
};

export const POST: RequestHandler = async ({ request, cookies }) => {
  /* return new Response("Forbidden", { status: 403, headers: { Vary: "Origin" } }); */

  const { allowed, headers } = cors(request.headers.get("origin"));
  if (!allowed) return new Response("Forbidden", { status: 403, headers });

  const ct = request.headers.get("content-type") ?? "";
  if (!ct.toLowerCase().includes("multipart/form-data")) {
    return new Response("Unsupported Media Type", { status: 415, headers });
  }
  const form = await request.formData();
  const raw = form.get("session");

  if (typeof raw !== "string") {
    return new Response("Bad Request", { status: 400, headers });
  }
  if (raw.length > 2_000_000) {
    /* this shouldnt be possiblen normal run */
    return new Response("Payload Too Large", { status: 413, headers });
  }

  let s: any;
  try {
    s = JSON.parse(raw);
  } catch {
    return new Response("Invalid JSON", { status: 400, headers });
  }
  const utm_source = cookies.get('utm_source') || "none";
  s.meta = { ...s.meta, utm_source }; /* 90 Days!!! */
  
  if (!cookies?.get("SESSION_KEY")) {
    s.session_id = `INVALID_SESSION_KEY-${Math.random().toString(36).slice(2) + "-" + Date.now().toString(36)}`;
  }
  if (!s?.order) s.order = "NOORDER";

  const row = {
    session_id: s.session_id ?? cookies?.get("SESSION_KEY"),
    eval_id: s.eval_id,
    order: s.order,
    timings: s.timings ?? {},
    meta: s.meta ?? { },
    steps: Array.isArray(s.steps) ? s.steps : [],
    questionary_demo: s.questionary_demo ?? s.demo ?? {},
    messages: Array.isArray(s.messages) ? s.messages : [],
  };

  console.log("row", row);

  const { error } = await supabaseClient.from("Evaluations").insert([row]);
  if (error) {
    server_exhausted.set(true);
    console.error("Supabase insert error:", error);
    return new Response("Insert failed", { status: 500, headers });
  }

  try {
    await incrementCounter(s.order, s.session_id);
  } catch (e) {
    console.error("Counter increment failed:", e);
  }
  server_exhausted.set(false);
  return new Response(null, { status: 204, headers });
};

// (optional) keep GET blocked
export const GET: RequestHandler = async () =>
  json({ error: "Method Not Allowed *_* whatcha doing here?" }, { status: 405 });

/* import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_KEY } from '$env/static/public'; */
/* https://github.com/supabase-community/svelte-kanban/blob/main/src/routes/db.js */
/* https://supabase.com/docs/guides/getting-started/quickstarts/sveltekit */
/* https://supabase.com/dashboard/project/pcqectlutakycuhhgwah/auth/policies?search=17284&schema=public */
/* https://supabase.com/dashboard/project/pcqectlutakycuhhgwah/editor/17284?schema=public */