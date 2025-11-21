import { dev } from "$app/environment";
import { json, type RequestHandler } from "@sveltejs/kit";
/* import { getSessionOrder } from "$lib/server/supabaseServer"; */

const RAW_ALLOWED = [
  "http://localhost:5173",
  /* "http://localhost:5174", */
  "https://traustdumir.de",
  "https://www.traustdumir.de"
];

const norm = (o?: string | null) => (o ?? "").replace(/\/+$/, "").toLowerCase();
const ALLOWED = new Set(RAW_ALLOWED.map(norm));

const cors = (origin: string | null) => {
  const origin_norms = norm(origin);
  const allowed = dev || !origin_norms || ALLOWED.has(origin_norms);
  return {
    allowed,
    headers: {
      "Access-Control-Allow-Origin": allowed ? (origin_norms || "*") : "",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "content-type",
      "Access-Control-Max-Age": "600",
      "Vary": "Origin"
    }
  };
};

export const OPTIONS: RequestHandler = async ({ request }) => {
  const { allowed, headers } = cors(request.headers.get("origin"));
  return new Response(null, { status: allowed ? 204 : 403, headers });
};

export const POST: RequestHandler = async ({ request }) => {
  const { allowed, headers } = cors(request.headers.get("origin"));
  if (!allowed) return json({ error: "Forbidden" }, { status: 403, headers: { Vary: "Origin" } });

  /* const session_order = await getSessionOrder(); */
  return json(
     "AB",
    { headers: { ...headers, "Cache-Control": "no-store" } }
  );
};

export const GET: RequestHandler = async () =>
  json({ error: "Method Not Allowed *_* whatcha doing here?" }, { status: 405 });
