export const load = ({ url, cookies }) => {
  const consent = cookies.get("consent_analytics") === "true";
  const utm_source = url.searchParams.get("utm_source");

  if (consent && utm_source) {
    cookies.set("utm_source", utm_source, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      maxAge: 60 * 60 * 24 * 90,
    });
  }
  return { utm_source };
};
