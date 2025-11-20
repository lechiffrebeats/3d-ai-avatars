import { get } from "svelte/store";
import { statistics } from "./Aggregate";
import {
  getTaskShitForUser,
  getVariantRatings,
  makeTaskRatingDeltasByCanon,
  mapDevice,
  mapLangLevel,
  mapStatus,

} from "./HypothesisHelper";
import { metric_form_general } from "./HelpersMath";
import {
  oneSampleTGreater,
  oneSampleTLess,
  ksNormalityTest,
  tostPaired,
  wilcoxonLess,
  wilcoxonSignedRankGreater,
  math_hypothesis_order,
  math_hypotheses_corr,
  tests_order_stats,
  tests_avatar_stats,
} from "./HypothesisTests";

/* ────────────────────────────────────────────────────────────────────────── */
/* Settings                                                                  */
/* ────────────────────────────────────────────────────────────────────────── */

export const mathSettings = { alpha: 0.05, sesoi: 0.3 };

/* ────────────────────────────────────────────────────────────────────────── */
/* Helpers                                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

const toNums = (a: any[]) => (a ?? []).map(Number).filter(Number.isFinite);
const meanSafe = (a: any[]) => {
  const v = toNums(a);
  return v.length ? v.reduce((s, x) => s + x, 0) / v.length : NaN;
};
const isFiniteNum = (x: any) => Number.isFinite(Number(x));
const meanOfAnswers = (arr: any[]) => {
  const v = (arr ?? []).map((d) => Number(d?.answer)).filter(isFiniteNum);
  return v.length ? v.reduce((s, x) => s + x, 0) / v.length : NaN;
};
const pushIfFinite = (arr: any[], v: any) => {
  if (Number.isFinite(v.value)) arr.push(v);
};
const isPositiveGaaisLabel = (qid: string) => qid.split("_")[1]?.startsWith("p");

/* ────────────────────────────────────────────────────────────────────────── */
/* One normalizer to map everything to −3…+3                                  */
/* ────────────────────────────────────────────────────────────────────────── */
type M3P3Mode = "level" | "delta" | "prop" | "deltaProp";

function toMinus3Plus3String(v: number | null, min: number, max: number): number | null {
  if (v == null || !Number.isFinite(+v) || +v === 0) return null;
  return ((+v - min) / (max - min)) * 6 - 3;
}

function toM3P3(
  v: number | null | undefined,
  mode: M3P3Mode,
  opts?: { min?: number; max?: number }
): number | null {
  if (v == null || !Number.isFinite(+v)) return null;
  switch (mode) {
    case "level": {
      const min = opts?.min ?? 1;
      const max = opts?.max ?? 7;
      const mid = (min + max) / 2;
      const half = (max - min) / 2;
      if (!half) return null;
      return ((+v - mid) / half) * 3;
    }
    case "delta": {
      const min = opts?.min ?? 1;
      const max = opts?.max ?? 7;
      const full = max - min;
      if (!full) return null;
      return ((+v) / full) * 6 * 0.5;
    }
    case "prop":
      return (+v - 0.5) * 6;
    case "deltaProp":
      return (+v) * 3;
  }
}

const v7_to_m3p3 = (v: any) => toM3P3(Number(v), "level", { min: 1, max: 7 });
const v5_to_m3p3 = (v: any) => toM3P3(Number(v), "level", { min: 1, max: 5 });
const delta7_to_m3p3 = (d: any) => toM3P3(Number(d), "delta", { min: 1, max: 7 });
const prop_to_m3p3 = (p: any) => toM3P3(Number(p), "prop");
const deltaProp_to_m3p3 = (d: any) => toM3P3(Number(d), "deltaProp");

/* ────────────────────────────────────────────────────────────────────────── */
/* Aggregation                                                                */
/* ────────────────────────────────────────────────────────────────────────── */
function math_aggregate() {
  const allSessions = get(statistics);

  const out = (allSessions.all?.aggregated ?? []).map((currSession: any) => {
    const sid = currSession.session_id;
    const finalStats = allSessions?.final.aggregated;
    const order = currSession.order;
    const avatarType = currSession?.meta?.avatar_gender
    const numberMessages = currSession?.meta?.msg_count;

    const trust = finalStats.comp_trust?.values_x_session_id?.find((e) => e.session_id === sid)?.answer;
    const comfort = finalStats.comp_comfort?.values_x_session_id?.find((e) => e.session_id === sid)?.answer;
    const understanding = finalStats.comp_understanding?.values_x_session_id?.find((e) => e.session_id === sid)?.answer;

    const tlx_a = allSessions.tlx?.by_session?.[sid]
      .filter((e) => e.question_id.startsWith("A"))
      .map((e) => ({
        question_id: e.question_id,
        answer: e.question_id?.includes("performance") ? 8 - Number(e.answer) : Number(e.answer),
      }));

    const tlx_b = allSessions.tlx?.by_session?.[sid]
      .filter((e) => e.question_id.startsWith("B"))
      .map((e) => ({
        question_id: e.question_id,
        answer: e.question_id?.includes("performance") ? 8 - Number(e.answer) : Number(e.answer),
      }));

    const gaais_all_reversed = (allSessions.gaais?.by_session?.[sid] ?? []).map((e: any) => ({
      question_id: e.question_id,
      answer: isPositiveGaaisLabel(e.question_id) ? Number(e.answer) : 6 - Number(e.answer),
    }));

    const gaais_pos = gaais_all_reversed.filter((e: any) => e.question_id.split("_")[1].startsWith("p"));
    const gaais_neg_rev = gaais_all_reversed.filter((e: any) => e.question_id.split("_")[1].startsWith("n"));

    const { variantRating_a, variantRating_b } = getVariantRatings(allSessions, sid);

    const demographie = allSessions.demographie?.by_session?.find((e: any) => e.session_id === sid)?.data;

    const {
      taskData_a,
      taskData_b,
      taskFreeData_a,
      taskFreeData_b,
      taskData_Correctness_a,
      taskData_Correctness_b,
    } = getTaskShitForUser(allSessions, sid);

    const variantDeltas = (variantRating_a ?? []).map((a: any) => {
      const key = a.question_id.split("_")[2];
      const b = (variantRating_b ?? []).find((bb: any) => bb.question_id.split("_")[2] === key);
      const d = (Number(a.answer) ?? NaN) - (Number(b?.answer) ?? NaN);
      return { name: a.question_id, Δ_m3p3: delta7_to_m3p3(d) };
    });

    const tlxDeltas = (tlx_a ?? []).map((a: any) => {
      const key = a.question_id.split("_")[2];
      const b = (tlx_b ?? []).find((bb: any) => bb.question_id.split("_")[2] === key);
      const d = (Number(a.answer) ?? NaN) - (Number(b?.answer) ?? NaN);
      return { name: a.question_id, Δ_m3p3: delta7_to_m3p3(d) };
    });

    const taskDeltas = (taskData_Correctness_a ?? []).map((a: any) => {
      const b = (taskData_Correctness_b ?? []).find((bb: any) => bb.equiv_Id === a.equiv_Id);
      const da = Number(a.answer);
      const db = Number(b?.answer);
      const d = (Number.isFinite(da) ? da : NaN) - (Number.isFinite(db) ? db : NaN);
      return { name: a.equiv_Id, Δ_m3p3: deltaProp_to_m3p3(d) };
    });

    const taskRatingDeltas = makeTaskRatingDeltasByCanon(taskData_a, taskData_b, false);
    const taskRatingFreeDeltas = makeTaskRatingDeltasByCanon(taskFreeData_a, taskFreeData_b, true);

    const finalDeltas = [
      { name: "dv_trust", Δ_m3p3: v7_to_m3p3(trust) },
      { name: "dv_comfort", Δ_m3p3: v7_to_m3p3(comfort) },
      { name: "dv_understanding", Δ_m3p3: v7_to_m3p3(understanding) },
    ];

    const finalmath = {
      session_id: sid,
      session: currSession,
      iv: {
        iv_order: order,
        iv_gaais: { raw: { pos: gaais_pos, neg_rev: gaais_neg_rev, total_rev: gaais_all_reversed } },
        iv_demographie: demographie,
        avatarType: avatarType,
      },
      dv: {
        dv_variantRating: {
          raw_a: variantRating_a,
          raw_b: variantRating_b,
          deltas: variantDeltas,
          deltasMean: meanSafe(variantDeltas.map((e: any) => e.Δ_m3p3)),
        },
        dv_tlx: {
          raw_a: tlx_a,
          raw_b: tlx_b,
          deltas: tlxDeltas,
          deltasMean: meanSafe(tlxDeltas.map((e: any) => e.Δ_m3p3)),
        },
        dv_taskCorrectness: {
          raw_a: taskData_Correctness_a,
          raw_b: taskData_Correctness_b,
          deltas: taskDeltas,
          deltasMean: meanSafe(taskDeltas.map((e: any) => e.Δ_m3p3)),
        },
        dv_taskRating: {
          raw_a: taskData_a,
          raw_b: taskData_b,
          deltas: (taskRatingDeltas?.deltas ?? []).map((r: any) => ({ ...r, Δ_m3p3: delta7_to_m3p3(r.Δ_answer) })),
          deltasMean: meanSafe((taskRatingDeltas?.deltas ?? []).map((r: any) => delta7_to_m3p3(r.Δ_answer))),
        },
        dv_taskRatingFree: {
          raw_a: taskFreeData_a,
          raw_b: taskFreeData_b,
          deltas: (taskRatingFreeDeltas?.deltas ?? []).map((r: any) => ({ ...r, Δ_m3p3: delta7_to_m3p3(r.Δ_answer) })),
          deltasMean: meanSafe((taskRatingFreeDeltas?.deltas ?? []).map((r: any) => delta7_to_m3p3(r.Δ_answer))),
        },
        dv_final: {
          raw: { trust, comfort, understanding },
          deltas: finalDeltas,
          deltasMean: meanSafe(finalDeltas.map((e) => e.Δ_m3p3)),
        },
        dv_finalTrust: {
          raw: { trust },
          deltas: [{ name: "dv_trust", Δ_m3p3: v7_to_m3p3(trust) }],
          deltasMean: v7_to_m3p3(trust),
        },
        dv_finalComfort: {
          raw: { comfort },
          deltas: [{ name: "dv_comfort", Δ_m3p3: v7_to_m3p3(comfort) }],
          deltasMean: v7_to_m3p3(comfort),
        },
        dv_finalUnderstanding: {
          raw: { understanding },
          deltas: [{ name: "dv_understanding", Δ_m3p3: v7_to_m3p3(understanding) }],
          deltasMean: v7_to_m3p3(understanding),
        },
      },
    };
    return finalmath;
  });

  return out;
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Composites (all already −3…+3), HIER WIR ALLES AUF 3P3 
GEKLATSCHT, die IVS JZU AUCH VORHER NUR DIE DVS               */
/* ────────────────────────────────────────────────────────────────────────── */

function math_basic_composite(basic_composite: any[]) {
  const variant_composite: any[] = [];
  const tlx_composite: any[] = [];
  const taskCorrectness_composite: any[] = [];
  const taskRating_composite: any[] = [];
  const taskRatingFree_composite: any[] = [];
  const final_composite: any[] = [];
  const finalTrust_composite: any[] = [];
  const finalComfort_composite: any[] = [];
  const finalUnderstanding_composite: any[] = [];

  basic_composite.forEach((s) => {
    const sid = s.session_id;
    pushIfFinite(variant_composite, { sid, value: s.dv?.dv_variantRating?.deltasMean });
    pushIfFinite(tlx_composite, { sid, value: s.dv?.dv_tlx?.deltasMean });
    pushIfFinite(taskCorrectness_composite, { sid, value: s.dv?.dv_taskCorrectness?.deltasMean });
    pushIfFinite(taskRating_composite, { sid, value: s.dv?.dv_taskRating?.deltasMean });
    pushIfFinite(taskRatingFree_composite, { sid, value: s.dv?.dv_taskRatingFree?.deltasMean });
    pushIfFinite(final_composite, { sid, value: s.dv?.dv_final?.deltasMean });
    pushIfFinite(finalTrust_composite, { sid, value: s.dv?.dv_finalTrust?.deltasMean });
    pushIfFinite(finalComfort_composite, { sid, value: s.dv?.dv_finalComfort?.deltasMean });
    pushIfFinite(finalUnderstanding_composite, { sid, value: s.dv?.dv_finalUnderstanding?.deltasMean });
  });

  const AB = basic_composite.filter((b) => b.iv?.iv_order === "AB");
  const BA = basic_composite.filter((b) => b.iv?.iv_order === "BA");

  const finalTrust_AB_composite = AB.map((b) => ({ sid: b.session_id, value: b.dv?.dv_finalTrust?.deltasMean }));
  const finalTrust_BA_composite = BA.map((b) => ({ sid: b.session_id, value: b.dv?.dv_finalTrust?.deltasMean }));

  const demo_status_composite = basic_composite.map((b) => ({
    sid: b.session_id,
    value: toMinus3Plus3String(mapStatus(b.iv?.iv_demographie?.demo_status), 1, 6),
  }));
  const demo_device_composite = basic_composite.map((b) => ({
    sid: b.session_id,
    value: toMinus3Plus3String(mapDevice(b.iv?.iv_demographie?.demo_device), 1, 5),
  }));
  const demo_lang_level_composite = basic_composite.map((b) => ({
    sid: b.session_id,
    value: toMinus3Plus3String(mapLangLevel(b.iv?.iv_demographie?.demo_lang_level), 1, 6),
  }));

  const avatarTypes_composite = basic_composite.map((b) => ({
    sid: b.session_id,
    value: b.iv?.avatarType,
  }))

  const aiExp_composite = basic_composite.map((b) => ({
    sid: b.session_id,
    value: v7_to_m3p3(b.iv?.iv_demographie?.demo_ai_experience),
  }));

  const fam_composite = basic_composite.map((b) => ({
    sid: b.session_id,
    value: v7_to_m3p3(b.iv?.iv_demographie?.demo_domain_familiarity),
  }));

  const gaais_composite = basic_composite.map((b) => ({
    sid: b.session_id,
    value: v5_to_m3p3(meanOfAnswers(b.iv?.iv_gaais?.raw?.total_rev)),
  }));

  const gaai_pos_composite = basic_composite.map((b) => ({
    sid: b.session_id,
    value: v5_to_m3p3(meanOfAnswers(b.iv?.iv_gaais?.raw?.pos)),
  }));

  const gaai_neg_composite = basic_composite.map((b) => ({
    sid: b.session_id,
    value: v5_to_m3p3(meanOfAnswers(b.iv?.iv_gaais?.raw?.neg_rev)),
  }));

  return {
    variant_composite,
    tlx_composite,
    taskCorrectness_composite,
    taskRating_composite,
    taskRatingFree_composite,
    final_composite,
    finalTrust_composite,
    finalComfort_composite,
    finalUnderstanding_composite,
    finalTrust_AB_composite,
    finalTrust_BA_composite,
    fam_composite,
    aiExp_composite,
    demo_status_composite,
    demo_device_composite,
    avatarTypes_composite,
    demo_lang_level_composite,
    /* correct_composite, */
    gaais_composite,
    gaai_pos_composite,
    gaai_neg_composite,
  };
}

/* ────────────────────────────────────────────────────────────────────────── */
/* EINFACH VON ALLEN SESSIONS DIE DELTAN ARRAYEN         + metric_form_general die ganzen default dingerf                                 */
/* ────────────────────────────────────────────────────────────────────────── */
const get_vals = (comp: any, name: string) =>
  comp?.[name]?.map((k: any) => k.value)?.filter(isFiniteNum) ?? [];

export function math_metrics(_: any[], comp_entries: any) {
  const comp = comp_entries;

  /* DVS */
  const deltaFinalIndex = get_vals(comp, "final_composite");
  const deltaFinalTrust = get_vals(comp, "finalTrust_composite");
  const deltaFinalComfort = get_vals(comp, "finalComfort_composite");
  const deltaFinalUnderstanding = get_vals(comp, "finalUnderstanding_composite");
  const deltaSP = get_vals(comp, "variant_composite");
  const deltaTLX = get_vals(comp, "tlx_composite");
  const deltaTaskNorm = get_vals(comp, "taskRating_composite");
  const deltaTaskFree = get_vals(comp, "taskRatingFree_composite");
  const deltaTaskCorrect = get_vals(comp, "taskCorrectness_composite");
  const deltaFinalTrust_AB = get_vals(comp, "finalTrust_AB_composite");
  const deltaFinalTrust_BA = get_vals(comp, "finalTrust_BA_composite");

  /* IVWSSS */
  const famOverall = get_vals(comp, "fam_composite");
  /* const correctOverall = get_vals(comp, "correct_composite"); */
  const demo_statusOverall = get_vals(comp, "demo_status_composite");
  const demo_deviceOverall = get_vals(comp, "demo_device_composite");
  const demo_lang_levelOverall = get_vals(comp, "demo_lang_level_composite");
  const aiExpOverall = get_vals(comp, "aiExp_composite");
  const gaaisTotal = get_vals(comp, "gaais_composite");

  const descriptives = {
    deltaFinalIndex: metric_form_general(deltaFinalIndex, { scaleMin: -3, scaleMax: 3, metric_type: "ΔFinalComposite" }),
    deltaFinalTrust: metric_form_general(deltaFinalTrust, { scaleMin: -3, scaleMax: 3, metric_type: "ΔFinalTrust" }),
    deltaFinalComfort: metric_form_general(deltaFinalComfort, { scaleMin: -3, scaleMax: 3, metric_type: "ΔFinalComfort" }),
    deltaFinalUnderstanding: metric_form_general(deltaFinalUnderstanding, { scaleMin: -3, scaleMax: 3, metric_type: "ΔFinalUnderstanding" }),
    deltaFinalTrust_AB: metric_form_general(deltaFinalTrust_AB, { scaleMin: -3, scaleMax: 3, metric_type: "ΔFinalTrust_AB" }),
    deltaFinalTrust_BA: metric_form_general(deltaFinalTrust_BA, { scaleMin: -3, scaleMax: 3, metric_type: "ΔFinalTrust_BA" }),

    deltaTaskCorrect: metric_form_general(deltaTaskCorrect, { scaleMin: -3, scaleMax: 3, metric_type: "ΔCorrectness" }),
    deltaSP: metric_form_general(deltaSP, { scaleMin: -3, scaleMax: 3, metric_type: "ΔSP" }),
    deltaTLX: metric_form_general(deltaTLX, { scaleMin: -3, scaleMax: 3, metric_type: "ΔTLX" }),
    deltaTaskNorm: metric_form_general(deltaTaskNorm, { scaleMin: -3, scaleMax: 3, metric_type: "ΔTaskNormal" }),
    deltaTaskFree: metric_form_general(deltaTaskFree, { scaleMin: -3, scaleMax: 3, metric_type: "ΔTaskFree" }),

    fam: metric_form_general(famOverall, { scaleMin: -3, scaleMax: 3, metric_type: "FAM" }),
    /* corrOverall: metric_form_general(correctOverall, { scaleMin: -3, scaleMax: 3, metric_type: "Correctness" }), */
    aiexp: metric_form_general(aiExpOverall, { scaleMin: -3, scaleMax: 3, metric_type: "AIExp" }),
    gaaisTotal: metric_form_general(gaaisTotal, { scaleMin: -3, scaleMax: 3, metric_type: "GAAIS" }),
    demo_statusOverall: metric_form_general(demo_statusOverall, { scaleMin: -3, scaleMax: 3, metric_type: "DemoStatus" }),
    demo_deviceOverall: metric_form_general(demo_deviceOverall, { scaleMin: -3, scaleMax: 3, metric_type: "DemoDevice" }),
    demo_lang_levelOverall: metric_form_general(demo_lang_levelOverall, { scaleMin: -3, scaleMax: 3, metric_type: "DemoLangLevel" }),
  };

  const forTests = {
    deltaFinalTrust,
    deltaFinalComfort,
    deltaFinalUnderstanding,
    deltaFinalIndex,
    deltaSP,
    deltaTLX,

    fam: famOverall,
    aiexp: aiExpOverall,
    gaaisTotal,

    deltaFinalTrust_forH5: deltaFinalTrust,
    deltaFinalTrust_AB,
    deltaFinalTrust_BA,

    deltaTaskNorm,
    deltaTaskFree,
    deltaTaskCorrect,
  };

  return { descriptives, forTests };
}

/* ────────────────────────────────────────────────────────────────────────── */
/* NORMALITY SCHEKER     ksNormalityTest                                                              */
/* ────────────────────────────────────────────────────────────────────────── */
type SW = { W?: number; pValue?: number; skipped?: boolean; reason?: string };

function shapiroForAll(forTests: any) {
  const run = (x: number[]): SW => ksNormalityTest(x);
  return {
    deltaFinalTrust: run(forTests.deltaFinalTrust),
    deltaFinalComfort: run(forTests.deltaFinalComfort),
    deltaFinalUnderstanding: run(forTests.deltaFinalUnderstanding),

    deltaFinalIndex: run(forTests.deltaFinalIndex),
    deltaSP: run(forTests.deltaSP),
    deltaTLX: run(forTests.deltaTLX),

    deltaTaskNorm: run(forTests.deltaTaskNorm),
    deltaTaskFree: run(forTests.deltaTaskFree),
    deltaTaskCorrect: run(forTests.deltaTaskCorrect),
  };
}

/* ────────────────────────────────────────────────────────────────────────── */
/* HYPTOHSEN ABER ERST NUR TEST; MIT WILKO FALLBACK, TOST EIG EGL                                                                 */
/* ────────────────────────────────────────────────────────────────────────── */
export function math_hypotheses(forTests: any) {
  const { alpha, sesoi } = mathSettings;
  const sesoiLikert = sesoi;
  const sesoiCorrect = 0.3;

  const shapiro = shapiroForAll(forTests);

  const trust_t = oneSampleTGreater(forTests.deltaFinalTrust, 0);
  const trust_w = wilcoxonSignedRankGreater(forTests.deltaFinalTrust);
  const trust_eq = tostPaired(forTests.deltaFinalTrust, alpha, sesoiLikert);

  const comfort_t = oneSampleTGreater(forTests.deltaFinalComfort, 0);
  const comfort_w = wilcoxonSignedRankGreater(forTests.deltaFinalComfort);
  const comfort_eq = tostPaired(forTests.deltaFinalComfort, alpha, sesoiLikert);

  const understanding_t = oneSampleTGreater(forTests.deltaFinalUnderstanding, 0);
  const understanding_w = wilcoxonSignedRankGreater(forTests.deltaFinalUnderstanding);
  const understanding_eq = tostPaired(forTests.deltaFinalUnderstanding, alpha, sesoiLikert);

  const finalComposite_t = oneSampleTGreater(forTests.deltaFinalIndex, 0);
  const finalComposite_w = wilcoxonSignedRankGreater(forTests.deltaFinalIndex);
  const finalComposite_eq = tostPaired(forTests.deltaFinalIndex, alpha, sesoiLikert);

  const sp_t = oneSampleTGreater(forTests.deltaSP, 0);
  const sp_w = wilcoxonSignedRankGreater(forTests.deltaSP);
  const sp_eq = tostPaired(forTests.deltaSP, alpha, sesoiLikert);

  const tlx_t = oneSampleTLess(forTests.deltaTLX, 0);
  const tlx_w = wilcoxonLess(forTests.deltaTLX);
  const tlx_eq = tostPaired(forTests.deltaTLX, alpha, sesoiLikert);

  const corr_t = oneSampleTGreater(forTests.deltaTaskCorrect, 0);
  const corr_w = wilcoxonSignedRankGreater(forTests.deltaTaskCorrect);
  const corr_eq = tostPaired(forTests.deltaTaskCorrect, alpha, sesoiCorrect);

  const taskNorm_t = oneSampleTGreater(forTests.deltaTaskNorm, 0);
  const taskNorm_w = wilcoxonSignedRankGreater(forTests.deltaTaskNorm);
  const taskNorm_eq = tostPaired(forTests.deltaTaskNorm, alpha, sesoiLikert);

  const taskFree_t = oneSampleTGreater(forTests.deltaTaskFree, 0);
  const taskFree_w = wilcoxonSignedRankGreater(forTests.deltaTaskFree);
  const taskFree_eq = tostPaired(forTests.deltaTaskFree, alpha, sesoiLikert);

  return {
    Normality: shapiro,
    finals: {
      trust: {
        direction: "greater (Avatar > Text)",
        H0: "E[ΔFinalTrust] ≤ 0",
        H1: "E[ΔFinalTrust] > 0",
        ttest: trust_t,
        wilcoxon: trust_w,
        equivalence: { tost: trust_eq, sesoi: sesoiLikert, alpha },
        decision: (trust_t?.pValue ?? 1) < alpha ? "significant (Δ>0)" : "non-significant",
      },
      comfort: {
        direction: "greater (Avatar > Text)",
        H0: "E[ΔFinalComfort] ≤ 0",
        H1: "E[ΔFinalComfort] > 0",
        ttest: comfort_t,
        wilcoxon: comfort_w,
        equivalence: { tost: comfort_eq, sesoi: sesoiLikert, alpha },
        decision: (comfort_t?.pValue ?? 1) < alpha ? "significant (Δ>0)" : "non-significant",
      },
      understanding: {
        direction: "greater (Avatar > Text)",
        H0: "E[ΔFinalUnderstanding] ≤ 0",
        H1: "E[ΔFinalUnderstanding] > 0",
        ttest: understanding_t,
        wilcoxon: understanding_w,
        equivalence: { tost: understanding_eq, sesoi: sesoiLikert, alpha },
        decision: (understanding_t?.pValue ?? 1) < alpha ? "significant (Δ>0)" : "non-significant",
      },
      finalComposite: {
        direction: "greater (Avatar > Text)",
        H0: "E[ΔFinalIndex] ≤ 0",
        H1: "E[ΔFinalIndex] > 0",
        ttest: finalComposite_t,
        wilcoxon: finalComposite_w,
        equivalence: { tost: finalComposite_eq, sesoi: sesoiLikert, alpha },
        decision: (finalComposite_t?.pValue ?? 1) < alpha ? "significant (Δ>0)" : "non-significant",
      },
    },
    socialPresence: {
      direction: "greater (Avatar > Text)",
      H0: "E[ΔSP] ≤ 0",
      H1: "E[ΔSP] > 0",
      ttest: sp_t,
      wilcoxon: sp_w,
      equivalence: { tost: sp_eq, sesoi: sesoiLikert, alpha },
      decision: (sp_t?.pValue ?? 1) < alpha ? "significant (Δ>0)" : "non-significant",
    },
    tlx: {
      direction: "less (Avatar < Text workload)",
      H0: "E[ΔTLX] ≥ 0",
      H1: "E[ΔTLX] < 0",
      ttest: tlx_t,
      wilcoxon: tlx_w,
      equivalence: { tost: tlx_eq, sesoi: sesoiLikert, alpha },
      decision: (tlx_t?.pValue ?? 1) < alpha ? "significant (Δ<0)" : "non-significant",
    },
    correctness: {
      direction: "greater (Avatar > Text)",
      H0: "E[ΔCorrectness] ≤ 0",
      H1: "E[ΔCorrectness] > 0",
      ttest: corr_t,
      wilcoxon: corr_w,
      equivalence: { tost: corr_eq, sesoi: sesoiCorrect, alpha },
      decision: (corr_t?.pValue ?? 1) < alpha ? "significant (Δ>0)" : "non-significant",
    },
    taskRatings: {
      norm: {
        direction: "greater (Avatar > Text)",
        H0: "E[ΔTaskNorm] ≤ 0",
        H1: "E[ΔTaskNorm] > 0",
        ttest: taskNorm_t,
        wilcoxon: taskNorm_w,
        equivalence: { tost: taskNorm_eq, sesoi: sesoiLikert, alpha },
        decision: (taskNorm_t?.pValue ?? 1) < alpha ? "significant (Δ>0)" : "non-significant",
      },
      free: {
        direction: "greater (Avatar > Text)",
        H0: "E[ΔTaskFree] ≤ 0",
        H1: "E[ΔTaskFree] > 0",
        ttest: taskFree_t,
        wilcoxon: taskFree_w,
        equivalence: { tost: taskFree_eq, sesoi: sesoiLikert, alpha },
        decision: (taskFree_t?.pValue ?? 1) < alpha ? "significant (Δ>0)" : "non-significant",
      },
    },
  };
}

/* ────────────────────────────────────────────────────────────────────────── */
/* DAS GANTZE ABLAFUU                                                            */
/* ────────────────────────────────────────────────────────────────────────── */

export function quickMaths() {
  const basic = math_aggregate();
  const basic_composite = math_basic_composite(basic);
  const { descriptives, forTests } = math_metrics(basic, basic_composite);

  const tests = math_hypotheses(forTests);
  const corr  = math_hypotheses_corr(basic_composite);
  
  if (corr) {
    const interestingCorrelations = Object.entries(corr?.groups)
      .map(([group, correlations]) => {
        const filtered = correlations.filter(
          (test) =>
            typeof test.pearson === "number" &&
            Math.abs(test.pearson) > 0.5 &&
            Math.abs(test.pearson) < 1
        );
        return filtered.length > 0 ? [group, filtered] : null;
      })
      .filter(Boolean);
    console.log("INTERESTING", interestingCorrelations);
  }

  const AB = basic.filter(b => b.iv?.iv_order === "AB");
  const BA = basic.filter(b => b.iv?.iv_order === "BA");
  const Korraltion_order = math_hypothesis_order(AB, BA);
  tests_order_stats.set(Korraltion_order);

  const group_male = basic.filter(b => b.iv?.avatarType === "male");
  const group_female = basic.filter(b => b.iv?.avatarType === "female");
  const Korraltion_avatarType = math_hypothesis_order(group_male, group_female);
  tests_avatar_stats.set(Korraltion_avatarType);

/*   console.log("math_hypothesis_order", order); */
  return {/*  basic,  *//* basic_composite,  */descriptives, /* forTests,  */tests,"corr": corr.
groups
, Korraltion_order, Korraltion_avatarType };
}
