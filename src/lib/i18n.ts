import { browser } from "$app/environment";
import { register, init, locale, _, waitLocale } from "@rgglez/svelte-i18n";
import { get } from "svelte/store";

type Lang = "en" | "de";

register("en", () => import("./locales/en.json"));
register("de", () => import("./locales/de.json"));

function normalize(code?: string | null): Lang {
  const s = (code ?? "").toLowerCase();
  if (s.startsWith("de")) return "de";
  if (s.startsWith("en")) return "en";
  return "en";
}

export function detectLocale(): Lang {
  if (!browser) return "en";
  const urlLang = new URLSearchParams(location.search).get("lang");
  const saved = localStorage.getItem("locale");
  const nav = (navigator.languages && navigator.languages[0]) || navigator.language || "";
  return normalize(urlLang || saved || nav || "en");
}

init({
  fallbackLocale: "en",
  initialLocale: detectLocale(),
});

if (browser) {
  locale.subscribe((v) => {
    if (v) localStorage.setItem("locale", v);
  });
}

export async function setLocale(lang: string) {
  locale.set(normalize(lang));
  await waitLocale();
}

export const getLanguage = (): Lang => normalize(get(locale) || detectLocale());

export { _, locale, waitLocale };
