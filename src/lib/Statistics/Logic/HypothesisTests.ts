import ttest from "@stdlib/stats-ttest";
import wilcoxon from "@stdlib/stats-wilcoxon";
import { sampleCorrelation, sampleRankCorrelation, sampleCovariance, tTestTwoSample, variance, sampleVariance } from 'simple-statistics';
import kstest from '@stdlib/stats-kstest';
import mean from '@stdlib/stats-base-mean';
import stdev from '@stdlib/stats-base-stdev';
import normalCDF from '@stdlib/stats-base-dists-normal-cdf';
import { writable } from "svelte/store";
import jStat from 'jstat';

type Num = number | null;
type Row = { sid: string; value: any };
type Comp = Record<string, Row[]>;
type Transform = (v:number|null)=>number|null;
const transformers: Record<string, Transform> = {
  // already on [-3,+3]
  final_composite:  v => v,
  finalTrust_composite:      v => v,
  finalTrust_AB_composite:   v => v,
  finalTrust_BA_composite:   v => v,
  finalComfort_composite:    v => v,
  finalUnderstanding_composite: v => v,
  // Δ on 1–7 Likert (range [-6,+6]) → ÷2
  variant_composite:         v => (v == null ? null : v / 2),
  tlx_composite:             v => (v == null ? null : v / 2),
  taskRating_composite:      v => (v == null ? null : v / 2),
  taskRatingFree_composite:  v => (v == null ? null : v / 2),
  // [-1,+1] → ×3
  correct_composite:         v => (v == null ? null : v * 3),
  // 1→-3, 3→0, 5→+3
  gaais_composite:           v => (v == null ? null : (v - 3) * 1.5),
  //1–7 covariates → shift to [-3,+3]
  aiExp_composite:           v => (v == null ? null : v - 4),
  fam_composite:             v => (v == null ? null : v - 4),
  __default:                 v => v,
};

/* https://www.youtube.com/watch?v=I0qTafaNfhM */
/* ca. 15 columns! eine für jede messwert, dann 15x15 */
export const tests_cross_store  = writable()
/* pearsonQuick(x, y); */
export function scatter_matrix(comp: Comp) {
  const vars = Object.keys(comp);
  const sidSet = new Set<string>();/* alle sids */
  for (const v of vars) for (const r of comp[v] ?? []) sidSet.add(String(r.sid));
  const sids = [...sidSet].sort();

  const table: Record<string, (number | null)[]> = {};
  for (const v of vars) {
    const rows = comp[v] ?? [];
    const lut = new Map<string, any>(rows.map(r => [String(r.sid), r.value]));
    const tf = (transformers[v] ?? transformers.__default) as Transform;

    table[v] = sids.map(sid => {
      const raw = lut.get(sid);
      const val: Num = raw == null ? null : (fin(raw) ? Number(raw) : null);
      const norm = tf(val);
      return norm !== null && fin(norm) ? (norm as number) : null;
    });
  }
  tests_cross_store.set({ vars, sids, table });
  return { vars, sids, table };
}

const nums = (a:any[]) => (a??[]).map(Number).filter(Number.isFinite);
export const fin = (x:any)=>Number.isFinite(Number(x));

export const mappy = (arr?:{sid:string,value:number}[]) => {
  const mp = new Map<string,number>();
  (arr??[]).forEach(o=>{ const v=Number(o.value); if(fin(v)) mp.set(o.sid,v); });
  return mp;
};

const sanitize = (arr: number[]) =>
  (arr ?? []).map(Number).filter(Number.isFinite);

export function oneSampleTGreater(arr: number[], mu0 = 0) {
  const x = sanitize(arr).map(v => v - mu0);
  const n = x.length;
  if (n < 2) {
    return { skipped: true, reason: n === 0 ? "empty_array" : "insufficient_n", n, t: NaN, df: NaN, pValue: NaN, alternative: "greater" };
  }
  try {
    const r: any = ttest(x as any, { alternative: "greater" });
    return { ...r, n, alternative: "greater" };
  } catch (e) {
    return { skipped: true, reason: "ttest_failed", n, error: String(e), alternative: "greater" };
  }
}

export function oneSampleTLess(arr: number[], mu0 = 0) {
  const x = sanitize(arr).map(v => v - mu0);
  const n = x.length;
  if (n < 2) {
    return { skipped: true, reason: n === 0 ? "empty_array" : "insufficient_n", n, t: NaN, df: NaN, pValue: NaN, alternative: "less" };
  }
  try {
    const r: any = ttest(x as any, { alternative: "less" });
    return { ...r, n, alternative: "less" };
  } catch (e) {
    return { skipped: true, reason: "ttest_failed", n, error: String(e), alternative: "less" };
  }
}

export function wilcoxonLess(arr: number[]) {
  const x = (arr ?? []).map(Number).filter(Number.isFinite);
  const nz = x.filter(v => v !== 0);
  const n = nz.length;
  if (n === 0) return { skipped: true, reason: "all_diffs_zero", n, W: NaN, pValue: 1, alternative: "less" };
  if (n === 1) return { skipped: true, reason: "insufficient_n", n, W: NaN, pValue: 1, alternative: "less" };
  try {
    const zeros = Array(n).fill(0);
    const r: any = wilcoxon(nz, zeros, { alternative: "less" });
    return { ...r, n, alternative: "less" };
  } catch (e) {
    return { skipped: true, reason: "wilcoxon_failed", n, error: String(e), alternative: "less" };
  }
}

export function wilcoxonSignedRankGreater(diffs: number[]) {
  const x = sanitize(diffs);
  const nz = x.filter(v => v !== 0);
  const n = nz.length;
  if (n === 0) return { skipped: true, reason: "all_diffs_zero", n, W: NaN, pValue: 1, alternative: "greater" };
  if (n === 1) return { skipped: true, reason: "insufficient_n", n, W: NaN, pValue: 1, alternative: "greater" };
  try {
    const zeros = Array(n).fill(0);
    const r: any = wilcoxon(nz, zeros, { alternative: "greater" });
    return { ...r, n, alternative: "greater" };
  } catch (e) {
    return { skipped: true, reason: "wilcoxon_failed", n, error: String(e), alternative: "greater" };
  }
}

/* nicht genug Evidenz für einen Unterschied, 
iegt der wahre Mittelwert-Unterschied innerhalb eines praktisch irrelevanten Intervalls [−SESOI,+SESOI]? */
export function tostPaired(a: number[], alpha = 0.05, sesoi = 0.4) {
  const x = (a ?? []).map(Number).filter(Number.isFinite);
  const n = x.length;

  // sanity checks
  if (!(sesoi >= 0)) {
    return { skipped: true, reason: "invalid_sesoi", sesoi, alpha, n, pLower: NaN, pUpper: NaN, equivalent: false };
  }
  if (n < 2) {
    return { skipped: true, reason: n === 0 ? "empty_array" : "insufficient_n", sesoi, alpha, n, pLower: NaN, pUpper: NaN, equivalent: false };
  }

  try {
    const rLower: any = ttest(x.map(v => v + sesoi) as any, { alternative: "greater" });
    const rUpper: any = ttest(x.map(v => v - sesoi) as any, { alternative: "less" });
    const pLower = rLower?.pValue;
    const pUpper = rUpper?.pValue;
    const equivalent = pLower < alpha && pUpper < alpha;

    return {
      n,
      alpha,
      sesoi,
      lower: { alternative: "greater", pValue: pLower, t: rLower?.statistic, df: rLower?.df },
      upper: { alternative: "less",    pValue: pUpper, t: rUpper?.statistic, df: rUpper?.df },
      pLower,
      pUpper,
      equivalent
    };
  } catch (e) {
    return { skipped: true, reason: "tost_failed", error: String(e), sesoi, alpha, n, pLower: NaN, pUpper: NaN, equivalent: false };
  }
}


/* IV = was ich ändere,
DV = was sich dadurch ändert. */
export function ksNormalityTest(deltas: number[]) {
  const x = (deltas ?? []).map(Number).filter(Number.isFinite);
  const n = x.length, unique = new Set(x).size;
  if (n < 3) return { skipped:true, reason:'n<3' };
  if (unique < 3) return { skipped:true, reason:'constant/low variance', n, unique };

  const mu = mean(n, x, 1);
  const sd = stdev(n, 1, x, 1); 
  if (!Number.isFinite(sd) || sd === 0) return { skipped:true, reason:'zero_variance', n };

  const cdf = (v:number) => normalCDF(v, mu, sd);
  return kstest(x, cdf);
}

/* 
+	Beide steigen/sinken gemeinsam
−	Eine steigt, während die andere fällt
0	Keine gemeinsame Variation */
function safeCovariance(x: number[], y: number[]) {
  const n = Math.min(x.length, y.length);
  if (n < 2) return NaN;
  const allSame = (a: number[]) => a.every(v => v === a[0]);
  if (!x.length || !y.length) return NaN;
  if (allSame(x) || allSame(y)) return 0;
  try {
    return sampleCovariance(x, y);
  } catch {
    return NaN;
  }
}

export const tests_cross_stats = writable({});
export const tests_order_stats = writable({});
export const tests_avatar_stats = writable({});

export const crossCorrStore = writable<Record<string, { n: number; pearson: number; spearman: number }>>({});

/* https://www.youtube.com/watch?v=6uu4sFl1avE */

/* wenn es increases dann das andere auch immer ca. auch increases */
/* muss normalvertielt sein */
/* when both vars ~normal. */
/* wenn es increases the other never decreases */
/* spearman ist für nicht unbedingt normalvesteil, kleine sample size */
/*  when non-normal / ordinal. */
/* FÜR: deltaTaskCorrect, deltaTaskFree  */
/* AB vs BA, male vs female, desktop vs mobile, etc.
Spearman ROBUSTER!!!!
person + spearman
r ≈ +1: starker positiver linearer Zusammenhang → wenn X steigt, steigt Y.
r ≈ −1: starker negativer linearer Zusammenhang → wenn X steigt, sinkt Y.
r ≈ 0: kein linearer Zusammenhang (aber evtl. nichtlinearer) 
*/

export function math_hypotheses_corr(
  basic_composite: Record<string, { sid: string; value: number }[]>
) {
  const comp = { ...basic_composite };

  const DROP_KEYS = [
    "final_composite",
    "demo_status_composite",
    "demo_device_composite",
    "demo_lang_level_composite",
    "finalTrust_AB_composite",
    "finalTrust_BA_composite",
    "avatarTypes_composite"
  ];
  for (const k of DROP_KEYS) delete (comp as any)[k];
  
  const { table, vars } = scatter_matrix(comp);

  const pairs: Record<string, {
    n: number;
    pearson: number | null;
    spearman: number | null;
    covariance: number | null;
    firstKey: string;
    secondKey: string;
  }> = {};

  for (let i = 0; i < vars.length; i++) {
    for (let j = i + 1; j < vars.length; j++) {
      const a = vars[i], b = vars[j];
      const colA = table[a] ?? [];
      const colB = table[b] ?? [];

      const x: number[] = [], y: number[] = [];
      const N = Math.max(colA.length, colB.length);
      for (let k = 0; k < N; k++) {
        const va = colA[k], vb = colB[k];
        if (Number.isFinite(va) && Number.isFinite(vb)) { x.push(va as number); y.push(vb as number); }
      }

      const n = x.length;
      let pearson: number | null = null;
      let spearman: number | null = null;
      let covariance: number | null = null;

      if (n >= 3) {
        try { pearson  = sampleCorrelation(x, y); } catch {}
        try { spearman = sampleRankCorrelation(x, y); } catch {}
        try { covariance = safeCovariance(x, y); } catch {}
      }
      pairs[`${a}↔${b}`] = { n, pearson, spearman, covariance, firstKey: a, secondKey: b };
    }
  }

  const rows = Object.entries(pairs)
    .map(([key, v]) => {
      const rBest =
        Number.isFinite(v.pearson as number) ? (v.pearson as number) :
        Number.isFinite(v.spearman as number) ? (v.spearman as number) : 0;
      return { key, ...v, r: rBest, score: Math.abs(rBest) };
    })
    .sort((a, b) => b.score - a.score);

  const uniqueVars = Array.from(new Set(vars));
  const groups: Record<string, typeof rows> = Object.fromEntries(
    uniqueVars.map(v => [v, rows.filter(r => r.firstKey === v || r.secondKey === v)])
  );
  const byKey = Object.fromEntries(rows.map(r => [r.key, r]));
  const storePayload = { rows, groups, uniqueVars, byKey, pairs };

  crossCorrStore.set(storePayload);
  return storePayload;
}


function welchDf(x: number[], y: number[]) {
  const n1 = x.length, n2 = y.length;
  const s1 = sampleVariance(x), s2 = sampleVariance(y);
  const a = s1 / n1, b = s2 / n2;
  const num = (a + b) ** 2;
  const den = (a * a) / (n1 - 1) + (b * b) / (n2 - 1);
  return num / den;
}

function welchPValueTwoSided(t: number, df: number) {
  const pOne = 1 - jStat.studentt.cdf(Math.abs(t), df);
  return Math.min(1, 2 * pOne);
}

function hedgesG(x: number[], y: number[]) {
  /* Zeigt die praktische Relevanz eines Unterschieds  egal wie k n*/
  const n1 = x.length, n2 = y.length;
  const m1 = jStat.mean(x), m2 = jStat.mean(y);
  const s1 = jStat.stdev(x, true), s2 = jStat.stdev(y, true);
  const sPooled = Math.sqrt(((n1 - 1) * s1 ** 2 + (n2 - 1) * s2 ** 2) / (n1 + n2 - 2));
  const d = (m1 - m2) / sPooled;
  const J = 1 - 3 / (4 * (n1 + n2) - 9);
  return d * J;
}

function diffCi95(x: number[], y: number[]) {
  const n1 = x.length, n2 = y.length;
  const m1 = jStat.mean(x), m2 = jStat.mean(y);
  const s1 = sampleVariance(x), s2 = sampleVariance(y);
  const se = Math.sqrt(s1 / n1 + s2 / n2);
  const df = welchDf(x, y);
  const tcrit = jStat.studentt.inv(0.975, df);
  const diff = m1 - m2;
  return { diff, se, df, ci95: [diff - tcrit * se, diff + tcrit * se] };
}

const METRICS: Record<string, keyof any> = {
  variant:            "dv_variantRating",
  tlx:                "dv_tlx",
  taskCorrectness:    "dv_taskCorrectness",
  taskRating:         "dv_taskRating",
  taskRatingFree:      "dv_taskRatingFree",
  finalTrust:          "dv_finalTrust",
  finalComfort:       "dv_finalComfort",
  finalUnderstanding: "dv_finalUnderstanding",
};

export function math_hypothesis_order(groupOne: any[], groupTwo: any[]) {
  const mean = (a: number[]) => (a.length ? a.reduce((s,v)=>s+v,0)/a.length : NaN);

  const out: Record<string, any> = {};
  for (const [name, dvKey] of Object.entries(METRICS)) {
    const x = groupOne.map(b => Number(b.dv?.[dvKey]?.deltasMean)).filter(Number.isFinite);
    const y = groupTwo.map(b => Number(b.dv?.[dvKey]?.deltasMean)).filter(Number.isFinite);

    if (x.length < 2 || y.length < 2) {
      out[name] = { note:"insufficient_n", n_AB:x.length, n_BA:y.length };
      continue;
    }
    const { diff, se, df, ci95 } = diffCi95(x, y);
    const t = diff / se;
    const p = welchPValueTwoSided(t, df);
    const g = hedgesG(x, y);

    let sig = "";
    if (p < 0.001) sig = "< 0.001 ***";
    else if (p < 0.01) sig = "< 0.01 **";
    else if (p < 0.05) sig = "< 0.05 *";
    else sig = "n.s.";

    const apa = `${name}: t(${df.toFixed(2)}) = ${t.toFixed(2)}, p = ${p.toFixed(3)}, g = ${g.toFixed(2)}, 95% CI [${ci95[0].toFixed(2)}, ${ci95[1].toFixed(2)}] ${sig}`;

    out[name] = {
      n_AB: x.length,
      n_BA: y.length,
      mean_AB: mean(x),
      mean_BA: mean(y),
      diff, se, df, ci95, t, p, g,
      significance: sig,
      apa
    };
  }
  return out;
}