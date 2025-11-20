import { browser, dev } from "$app/environment";
import { injectSpeedInsights } from "@vercel/speed-insights/sveltekit";
import { writable } from "svelte/store";

export type Consent = {
  version: number;
  accepted: boolean;
  analytics: boolean;
  eval_storage: boolean;
  tos: boolean;
  ts: number;
};

const CONSENT_KEY = "HISTAR_CONSENT_V1";
const LITE_KEY = "HISTAR_LITE";
const TTL_MS = 1000 * 60 * 60 * 24 * 30 * 6; // 6 months

const UTM_COOKIE = "utm_source";
const UTM_TMP_KEY = "HISTAR_UTM_TMP"; // session-scoped holding area
const UTM_MAX_AGE = 60 * 60 * 24 * 90; // 90 days

function getSearchUTM(): string | null {
  if (!browser) return null;
  const v = new URLSearchParams(window.location.search).get("utm_source");
  return v && v.trim() ? v.trim() : null;
}

function setUtmCookie(val: string) {
  if (!browser) return;
  document.cookie = `${UTM_COOKIE}=${encodeURIComponent(val)}; Max-Age=${UTM_MAX_AGE}; Path=/; SameSite=Lax${isHttps() ? "; Secure" : ""}`;
}

function getUtmTmp(): string | null {
  if (!browser) return null;
  return sessionStorage.getItem(UTM_TMP_KEY);
}

function setUtmTmp(val: string) {
  if (!browser) return;
  sessionStorage.setItem(UTM_TMP_KEY, val);
}

function clearUtmTmp() {
  if (!browser) return;
  sessionStorage.removeItem(UTM_TMP_KEY);
}

function now() { return Date.now(); }
function maxAge() { return Math.floor(TTL_MS / 1000); }
function isHttps() { return browser && location.protocol === "https:"; }

function setCookie(name: string, value: string) {
  if (!browser) return;
  document.cookie = `${name}=${value}; Max-Age=${maxAge()}; Path=/; SameSite=Lax${isHttps() ? "; Secure" : ""}`;
}

function clearCookie(name: string) {
  if (!browser) return;
  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

let speedInsightsInjected = false;
export function maybeInjectSpeedInsights(allowed?: boolean | null) {
  if (!browser || dev || speedInsightsInjected || !allowed) return;
  injectSpeedInsights();
  speedInsightsInjected = true;
}

function storeUtmSourceWithConsent() {
  const p = new URLSearchParams(window.location.search);
  const val = p.get('utm_source');
  if (!val) return;
  document.cookie = `utm_source=${encodeURIComponent(val)}; Max-Age=${60*60*24*90}; Path=/; SameSite=Lax; Secure`;
}

function readConsent(): Consent | null {
  if (!browser) return null;
  const c = safeParse<Partial<Consent>>(localStorage.getItem(CONSENT_KEY));
  if (!c?.version) return null;
  if (now() - (c.ts ?? 0) > TTL_MS) return null;

  return {
    version: 1,
    accepted: !!c.accepted,
    analytics: !!c.analytics,
    eval_storage: c.eval_storage ?? true,
    tos: !!c.tos,
    ts: c.ts ?? now(),
  };
}

function writeConsent(c: Consent) {
  if (!browser) return;
  localStorage.setItem(CONSENT_KEY, JSON.stringify(c));
  setCookie("histar_consent", c.accepted ? "1" : "0");
  setCookie("histar_analytics", c.analytics ? "1" : "0");
  setCookie("histar_tos", c.tos ? "1" : "0");
}

export const consent = writable<Consent | null>(null);

export function loadConsent() {
  const c = readConsent();
  consent.set(c);
  maybePersistUtm(!!c?.analytics);
  if (c?.analytics) maybeInjectSpeedInsights(true);
}

export function acceptAllCookies() {
  const c: Consent = {
    version: 1,
    accepted: true,
    analytics: true,
    eval_storage: true,
    tos: true,
    ts: now(),
  };
  writeConsent(c);
  consent.set(c);
  maybePersistUtm(true);   
  maybeInjectSpeedInsights(true);
}

export function acceptEssentialOnly() {
  const c: Consent = {
    version: 1,
    accepted: true,
    analytics: false,
    eval_storage: true,
    tos: true,
    ts: now(),
  };
  writeConsent(c);
  maybePersistUtm(false);
  consent.set(c);
  maybeInjectSpeedInsights(false);
}

export function setAnalyticsAllowed(allowed: boolean) {
  const curr = readConsent();
  const c: Consent = {
    version: 1,
    accepted: curr?.accepted ?? true,
    analytics: allowed,
    eval_storage: curr?.eval_storage ?? true,
    tos: curr?.tos ?? true,
    ts: now(),
  };
  writeConsent(c);
  consent.set(c);
  maybePersistUtm(allowed);
  maybeInjectSpeedInsights(allowed);
}

export function revokeConsent() {
  if (!browser) return;
  localStorage.removeItem(CONSENT_KEY);
  clearCookie("histar_consent");
  clearCookie("histar_analytics");
  clearCookie("histar_tos");
  consent.set(null);
  clearCookie(UTM_COOKIE);
  clearUtmTmp();
  speedInsightsInjected = false;
}

export function hasConsent(): boolean { return !!readConsent()?.accepted; }
export function hasTOS(): boolean { return !!readConsent()?.tos; }
export function hasAnalytics(): boolean { return !!readConsent()?.analytics; }

function maybePersistUtm(analyticsAllowed: boolean) {
  if (!browser) return;

  const fromUrl = getSearchUTM();
  const fromTmp = getUtmTmp();

  if (analyticsAllowed) {
    const source = fromUrl || fromTmp;
    if (source) {
      setUtmCookie(source);
      clearUtmTmp();
    }
  } else {
    if (fromUrl) setUtmTmp(fromUrl);
  }
}

// ------------- lite mode (perf/prefs only) -------------
export const liteMode = writable(false);

function readLiteLS(): boolean | null {
  if (!browser) return null;
  const v = localStorage.getItem(LITE_KEY);
  return v === "1" ? true : v === "0" ? false : null;
}

function writeLite(v: boolean) {
  if (!browser) return;
  localStorage.setItem(LITE_KEY, v ? "1" : "0");
  setCookie("histar_lite", v ? "1" : "0");
  liteMode.set(v);
}

function hasWebGL2(): boolean {
  if (!browser) return false;
  const c = document.createElement("canvas");
  return !!c.getContext("webgl2");
}

function quickLiteHeuristics(): boolean {
  if (!hasWebGL2()) return true;
  const dm = (navigator as any).deviceMemory ?? 4;
  return dm < 8;
}

export function setLite(v: boolean) { writeLite(v); }

export function getLite(): boolean {
  const v = readLiteLS();
  return v ?? quickLiteHeuristics();
}

export function initLite(): boolean {
  if (!browser) return false;
  const url = new URL(window.location.href);
  const p = url.searchParams.get("lite");
  const fromParam = p === "1" || p === "true" ? true : p === "0" || p === "false" ? false : null;
  const chosen = fromParam ?? readLiteLS() ?? quickLiteHeuristics();
  writeLite(chosen);
  return chosen;
}
