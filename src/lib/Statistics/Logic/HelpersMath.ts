import { getAnswer } from "./HelpersStatisitcs";
import { sampleStandardDeviation } from "simple-statistics";
import quantile from "@stdlib/stats-base-dists-t-quantile";

export function nums(arr: (number | string)[]) {
  return (arr ?? []).map(Number).filter(Number.isFinite);
}

export const mean = (a: number[]) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : NaN);
export const median = (a: number[]) => {
  const v = nums(a);
  if (!v.length) return NaN;
  const s = [...v].sort((x, y) => x - y);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
// sample SD (n-1)
export const sd = (a: number[]) => {
  const v = nums(a);
  if (v.length < 2) return 0;
  const m = mean(v);
  return Math.sqrt(v.reduce((acc, x) => acc + (x - m) ** 2, 0) / (v.length - 1));
};

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export function metricFrom(list: any[], qid: string) {
  const answers = nums(list.map((t) => getAnswer(t, qid)));
  return { mean: mean(answers), median: median(answers), sd: sd(answers), answers };
}

/* https://simple-statistics.github.io/docs/#simple-statistics-docs */
export function metric_form_general(
  list: (number | string)[],
  { scaleMin = 1, scaleMax = 7, metric_type = "UNKNOWN" } = {}
) {
  const vals = nums(list).sort((a, b) => a - b);
  const n = vals.length;

  if (!n) {
    return {
      percent: 0,
      percent_ci95_low: NaN,
      percent_ci95_high: NaN,
      signed_percent: NaN,
      signed_ci95_low: NaN,
      signed_ci95_high: NaN,

      mean: NaN, median: NaN, min: NaN, max: NaN,
      sd: NaN, sum: 0, count: 0, range: NaN, variance: NaN, se: NaN,
      q1: NaN, q3: NaN, iqr: NaN,
      ci95_low: NaN, ci95_high: NaN, ci95_moe: NaN, tcrit95: NaN,
      list: [], metric_type, values: list
    };
  }

  // Interpolierte Quantile (für Q1/Q3)
  const qInterp = (arr: number[], p: number) => {
    if (arr.length === 1) return arr[0];
    const idx = (arr.length - 1) * p;
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    if (lo === hi) return arr[lo];
    const w = idx - lo;
    return arr[lo] * (1 - w) + arr[hi] * w;
  };

  const sum = vals.reduce((s, x) => s + x, 0);
  const m = sum / n;
  const med = n % 2 ? vals[(n - 1) / 2] : (vals[n / 2 - 1] + vals[n / 2]) / 2;
  const min = vals[0], max = vals[n - 1];
  const range = max - min;

  const q1 = qInterp(vals, 0.25);
  const q3 = qInterp(vals, 0.75);
  const iqr = q3 - q1;

  const s = n > 1 ? Math.sqrt(vals.reduce((acc, x) => acc + (x - m) ** 2, 0) / (n - 1)) : 0;
  const variance = s ** 2;
  const se = n > 0 ? s / Math.sqrt(n) : NaN;

  // 95%-KI (t-basiert)
  const df = n - 1;
  const tcrit95 = df > 0 ? quantile(0.975, df) : 1.959963984540054; // ≈ z
  const ci95_moe = Number.isFinite(se) && n > 1 ? tcrit95 * se : NaN;
  const ci95_low = Number.isFinite(ci95_moe) ? m - ci95_moe : NaN;
  const ci95_high = Number.isFinite(ci95_moe) ? m + ci95_moe : NaN;

  // Prozentabbildungen
  const span = scaleMax - scaleMin;
  const half = span / 2;
  const mid  = scaleMin + half;

  // <50 % = Text besser, >50 % = Avatar besser.
  const toPomp = (v: number) => ((v - scaleMin) / span) * 100;
  const percent = span > 0 ? clamp(toPomp(m), 0, 100) : NaN;
  const percent_ci95_low  = Number.isFinite(ci95_low)  && span > 0 ? clamp(toPomp(ci95_low),  0, 100) : NaN;
  const percent_ci95_high = Number.isFinite(ci95_high) && span > 0 ? clamp(toPomp(ci95_high), 0, 100) : NaN;

  // Signiertes % −100..+100 (0 = Skalenmitte; ideal für Δ-Skalen)
  const toSigned = (v: number) => (half !== 0 ? ((v - mid) / half) * 100 : NaN);
  const signed_percent   = toSigned(m);
  const signed_ci95_low  = Number.isFinite(ci95_low)  ? toSigned(ci95_low)  : NaN;
  const signed_ci95_high = Number.isFinite(ci95_high) ? toSigned(ci95_high) : NaN;

  return {
    // Prozentdarstellungen
    percent, percent_ci95_low, percent_ci95_high,
    signed_percent, signed_ci95_low, signed_ci95_high,

    // Klassiks
    mean: m, median: med, min, max, sd: s, sum, count: n, range, variance, se,
    q1, q3, iqr,

    // Konfidenzintervall
    ci95_low, ci95_high, ci95_moe, tcrit95,

    // Rohwerte & Meta
    list: vals, metric_type, values: list
  };
}
