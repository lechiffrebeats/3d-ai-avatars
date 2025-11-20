import { initialize_user_session } from "$lib/Misc/sessionStore";
import type { Handle, HandleFetch } from "@sveltejs/kit";

const TIMEOUT_MS = 20_000;
const PATH_PREFIX = "/histarBackend";

function gatewayTimeout() {
  return new Response(
    JSON.stringify({ ok: false, error: "Gateway Timeout", ms: TIMEOUT_MS }),
    { status: 504, headers: { "content-type": "application/json", "retry-after": "5" } }
  );
}

export const handle: Handle = async ({ event, resolve }) => {
  if (!event.url.pathname.startsWith(PATH_PREFIX)) return resolve(event);

  const ac = new AbortController();
  event.locals.timeoutSignal = ac.signal;
  const timeout = new Promise<Response>((r) => setTimeout(() => r(gatewayTimeout()), TIMEOUT_MS));
  const res = await Promise.race([resolve(event), timeout]);

  if (res.status === 504) ac.abort();
  return res;
};

export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
  const { timeoutSignal } = event.locals;
  if (event.url.pathname.startsWith(PATH_PREFIX) && timeoutSignal) {
    return fetch(request, { signal: timeoutSignal });
  }
  return fetch(request);
};
