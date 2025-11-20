/** @type {import('./$types').RequestHandler} */
export async function GET({ cookies }) {
  let id = cookies.get("SESSION_KEY");
  if (!id) {
    id = crypto.randomUUID();
    cookies.set("SESSION_KEY", id, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60, // 1 stunde
    });
  } else {
    cookies.set("SESSION_KEY", id, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60,
    });
  }
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
}
