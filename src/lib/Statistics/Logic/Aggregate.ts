import { writable } from "svelte/store"
import {  extractKeyDataFromSession, formatMs, groupByProp, niceLabel, pick, summarizeNormalizedUniversal, valsModdedInt } from "./HelpersStatisitcs";
import {  mean, median, metric_form_general, sd } from "./HelpersMath";
import { completionTimeSession } from "./Overall";
import {  PLATFORM_ICONS, statsCalculated } from "./Misc";
import { createTaskStatistics } from "./HelpersCharts";
import { getVariantStatisitcs } from "../Haupt/VARIANTE/CALC";
import { isPositiveGaais } from "../Haupt/GAAIS/Calc";

const DEMO_SCALES: Record<string, { min: number; max: number }> = {
  demo_ai_experience: { min: 1, max: 7 },
  demo_domain_familiarity: { min: 1, max: 7 },
  demo_age: { min: 0, max: 120 }
}

const fresh = () => ({
  all: { aggregated: [], raw: [] as any[], by_session: [] },
  metas: { aggregated: {}, raw: [] as any[] , by_session: []},
  steps: { aggregated: [], raw: [] as any[] , by_session: []},
  demographie: { aggregated: {}, raw: [] , by_session: []},
  evaluation: { aggregated: {}, raw: [] as any[], prefs: [], notes: [], notesAggregated: {}, prefsAggregated:[], prefs_metrics: {} , by_session: []},
  tasks: {aggregated: {}, raw: [], ab_metrics_total: {}, ab_metrics: {}, 
          a_metrics_total: {}, b_metrics_total:{}, a_metrics:{}, b_metrics:{}, a:[], b:[], by_session: []},
  tasksFree: {aggregated: {}, raw: [], ab_metrics_total: {}, ab_metrics: {}, 
          a_metrics_total: {}, b_metrics_total:{}, a_metrics:{}, b_metrics:{},a:[], b:[], by_session: []},

  variantRating: { aggregated: {}, raw: [] as any[], avatar :[], text:[] , by_session: []},
  tlx: { aggregated: {}, aggregatedReversed: {}, raw: [] as any[], avatar: [], text:[], total: {}, totalAvatar:{}, totalText:{}, by_session: [] },
  gaais: { aggregated: {}, raw: [] as any[], normalized: {}, positive: [], negative: [], positiveTotal:{}, negativeTotal:{}, by_session: [] },
  final: { aggregated: {}, raw: [] as any[], aggregatedPref:{} , by_session: []},
})

export const platformkeys = Object.keys(PLATFORM_ICONS)
export const statistics = writable(fresh())
export const boringStableKeys = ["all", "steps", "demographie", "tasks", "tlx", "gaais", "final"]

export function aggregate(rows: any[]) {
  const stats = fresh()
  
  const filteredSessions = (rows || []).filter((r) => {
    const s = r.session ?? r
    return Array.isArray(s?.steps) && s.steps.length >= 18
  })

  const sessions = []
  for (const r of filteredSessions) {
    const s = r.session ?? r
    s.completion_time = completionTimeSession(s)
    s.completion_time_Format = formatMs(s.completion_time)
    sessions.push(s)
    stats.all.by_session.push({session_id: s.session_id, data: s})
  }
  stats.all.aggregated = sessions;
  stats.all.raw = filteredSessions

  const metas = []
  for (const r of filteredSessions) {
    const s = r.session ?? r
    const metaCurr = s.meta
    const key = String(metaCurr.utm_source).toLowerCase()
    if (!PLATFORM_ICONS[key]) PLATFORM_ICONS[key] = { cnt: 0 }
    PLATFORM_ICONS[key].cnt++
    metaCurr.session_id = s.session_id

    /* BY SESSION ADDER */
    stats.metas.by_session.push({session_id: s.session_id, data: metaCurr})

    metas.push(metaCurr)
  }
  stats.metas.aggregated = metas
  const steps: any[] = []

  for (const r of filteredSessions) {
    const s = r.session ?? r
    for (const st of s.steps || []) {
      st.session_id = s.session_id
      steps.push(st)
      stats.steps.by_session.push({session_id: s.session_id, data: st})
    }
  }
  stats.steps.aggregated = steps

  const variantRatings = []
  /* SHOULD BE total * 2 */
  for (const step of stats.steps?.aggregated) {
    const variant = step.stable_key === "avatar-variant-rate-v1" || step.stable_key === "text-variant-rate-v1" || step.stable_key?.includes("variant") || step.titleKey?.includes("variant")
    if (variant) {
      variantRatings.push(step); 
      stats.variantRating.by_session.push({session_id: step.session_id, data: step})
    }
  }
  /* filterNoVariante(sessions) = 99f1281b-4c05-4168-8295-13a6d5ec1de0 */

  for (const r of filteredSessions) {
    const s = r.session ?? r
    const { notes, prefs, tasks, tasksFree, flat_Eval_Questions } = extractKeyDataFromSession(s)
    const session_id = s.session_id
    
    tasks?.map((t) => stats.tasks.raw?.push(t))
    flat_Eval_Questions?.map((f) => stats.evaluation.raw?.push(f))
    tasksFree?.map((f) => stats.tasksFree.raw?.push(f))
    prefs?.map((f) => stats.evaluation.prefs?.push(f))
    notes?.map((f) => stats.evaluation.notes?.push(f))

    stats.tasks.by_session.push({session_id: s.session_id, data: tasks})
    stats.tasksFree.by_session.push({session_id: s.session_id, data: tasksFree})
    stats.evaluation.by_session.push({session_id: s.session_id, data: flat_Eval_Questions})

    const demo = r.questionary_demo || {}
    demo.session_id = session_id
    for (const [k, raw] of Object.entries(demo)) {
      if (raw == null) continue
      const scale = DEMO_SCALES[k] ?? { min: 1, max: 7 }
      const bucket =
        stats.demographie.aggregated[k] ??
        (stats.demographie.aggregated[k] = {
          label: niceLabel(k, "Demo"),
          min: scale.min,
          max: scale.max,
          values: [] as { x: string | number; y: number; by_session: Record<string, number> }[],
          nums: [] as number[]
        })

      const numVal = typeof raw === "number" ? raw : (isNaN(Number(raw)) ? null : Number(raw))
      const x = (numVal ?? String(raw)) as string | number

      const i = bucket.values.findIndex(v => v.x === x)
      if (i >= 0) {
        bucket.values[i].y += 1
        bucket.values[i].by_session[session_id] = (bucket.values[i].by_session[session_id] ?? 0) + 1
      } else {
        bucket.values.push({ x, y: 1, by_session: { [session_id]: 1 } })
      }
      if (numVal !== null) bucket.nums.push(numVal)
    }
    stats.demographie.raw?.push(demo)
    stats.demographie.by_session.push({session_id: s.session_id, data: demo})
  }

  for (const k in stats.demographie.aggregated) {
    const b = stats.demographie.aggregated[k]
    const arr: number[] = b.nums || []
    if (arr.length) {
      const srt = [...arr].sort((a, b) => a - b)
      b.mean = mean(srt)
      b.median = median(srt)
      b.min = srt[0]
      b.max = srt[srt.length - 1]
      b.sd = sd(srt)
    } else {
      b.mean = b.median = b.min = b.max = b.sd = null
    }
    delete b.nums

    /* that nicce formateee */
    const getDomValIdFormat =(id, entire)=> {
      return ({
        answer: entire.x, 
        session_id: id}
      )}
    const currVals = b.values?.map((s)=> Object.keys(s.by_session)?.map((id)=>getDomValIdFormat(id, s))?.flat() || []).flat()
    b.values_x_session_id = currVals
  }

  /* tasks*/
  const { statsPerTasks, statsTotalTasksAvatar, statsTotalTasksText, statsPersTasks_avatar, 
    statsPersTasks_text, tasks_avatar, tasks__text ,sessions_groupedByTasks } = createTaskStatistics(
   stats.tasks.raw, false
  );

  const resultFree = createTaskStatistics(
   stats.tasksFree.raw, true
  );

  /* Tasks Free */
  stats.tasksFree.a = Object.entries(resultFree.tasks_avatar)
  stats.tasksFree.b = Object.entries(resultFree.tasks__text)
  stats.tasksFree.ab_metrics = resultFree.statsPerTasks
  stats.tasksFree.aggregated = resultFree.sessions_groupedByTasks 
  stats.tasksFree.a_metrics = resultFree.statsPersTasks_avatar
  stats.tasksFree.b_metrics = resultFree.statsPersTasks_text
  stats.tasksFree.b_metrics_total = resultFree.statsTotalTasksText
  stats.tasksFree.a_metrics_total = resultFree.statsTotalTasksAvatar
  
  /* tasks */
  stats.tasks.a = Object.entries(tasks_avatar)
  stats.tasks.b = Object.entries(tasks__text)
  stats.tasks.ab_metrics = statsPerTasks
  stats.tasks.aggregated = sessions_groupedByTasks 
  stats.tasks.a_metrics = statsPersTasks_avatar
  stats.tasks.b_metrics = statsPersTasks_text
  stats.tasks.b_metrics_total = statsTotalTasksText
  stats.tasks.a_metrics_total = statsTotalTasksAvatar

  /* Eavluations fragen  */
  stats.evaluation.aggregated = summarizeNormalizedUniversal(stats.evaluation.raw, 7, false, "EVAL_QUESTIONS")
  stats.evaluation.notesAggregated = summarizeNormalizedUniversal(stats.evaluation.notes, 4, false, "EVAL_NOTES")
  stats.evaluation.prefs = (stats.evaluation.prefs ?? []).map(e => ({
    ...e,
    answer: valsModdedInt(e.answer)
  }));
  const finalSelectMetric = summarizeNormalizedUniversal(Object.values(stats.evaluation.prefs), 4, false, "FINAL_QUESTIONS")

  /* GAAIS */
  stats.gaais.raw = pick(/^gaais_/, stats.evaluation.raw)
  stats.gaais.by_session = groupByProp(stats.gaais.raw, "session_id")
  stats.gaais.aggregated = summarizeNormalizedUniversal(stats.gaais.raw, 5, false, "GAAIS_QUESTIONS")
  stats.gaais.normalized = summarizeNormalizedUniversal(stats.gaais.raw, 5, true, "GAAIS_QUESTIONS")
  stats.gaais.positive = Object.values(stats.gaais.aggregated)?.filter((e) => isPositiveGaais(e));
  stats.gaais.negative = Object.values(stats.gaais.aggregated)?.filter((e) => !isPositiveGaais(e));
  const positiveValues = stats.gaais.positive.map((e) => e.values).flat()
  const negativeValues = stats.gaais.negative.map((e) => e.values).flat()
  
  stats.gaais.positiveTotal ={ ...metric_form_general(positiveValues, {scaleMin: 1, scaleMax: 5}), values_x_session_id: stats.gaais.positive.map((e) => e.values_x_session_id).flat()}
  stats.gaais.negativeTotal ={ ...metric_form_general(negativeValues, {scaleMin: 1, scaleMax: 5}), values_x_session_id: stats.gaais.negative.map((e) => e.values_x_session_id).flat()}

  /* Variant rating */
  stats.variantRating.aggregated = variantRatings
  const { groupAvatar, groupText } = getVariantStatisitcs(stats.variantRating.aggregated);
  stats.variantRating.avatar = groupAvatar
  stats.variantRating.text = groupText

  /* tlx */
  stats.tlx.raw = pick(/^A_tlx_|^B_tlx_/i, stats.evaluation.raw)
  stats.tlx.by_session = groupByProp(stats.tlx.raw, "session_id")
  stats.tlx.aggregated = summarizeNormalizedUniversal(stats.tlx.raw, 7, false, "TLX")
  stats.tlx.aggregatedReversed = summarizeNormalizedUniversal(stats.tlx.raw, 7, true, "TLX")

  const res = summarizeNormalizedUniversal(stats.tlx.raw, 7, false, "NASA_TLX")
  const nasa_a_pre = Object.values(Object.fromEntries(Object.entries(res).filter(([id,_]) => id.startsWith("A"))))   /* bro */
  const nasa_b_pre = Object.values(Object.fromEntries(Object.entries(res).filter(([id,_]) => id.startsWith("B")) ) )  /* bro */
  stats.tlx.avatar = nasa_a_pre
  stats.tlx.text = nasa_b_pre

  const onlyValsTLX = Object.values(stats.tlx.aggregatedReversed).map((e) => e.values).flat()
  const valsTlx = Object.values(stats.tlx.aggregatedReversed).map((e) => e.values_x_session_id).flat()

  /* der shit muss reversed sein bei performance */
  stats.tlx.total = {...metric_form_general(onlyValsTLX, {scaleMin: 1, scaleMax: 7}), valsTlx}
  stats.tlx.totalAvatar = {...metric_form_general(nasa_a_pre.map((e) => e.values).flat(), {scaleMin: 1, scaleMax: 7}), values_x_session_id: nasa_a_pre.map((e) => e.values_x_session_id).flat()}
  stats.tlx.totalText = {...metric_form_general(nasa_b_pre.map((e) => e.values).flat(), {scaleMin: 1, scaleMax: 7}), values_x_session_id: nasa_b_pre.map((e) => e.values_x_session_id).flat()}

  /* final */
  stats.final.raw = pick(/^pref_|^comp_/i, stats.evaluation.raw)
  stats.final.by_session = groupByProp(stats.final.raw, "session_id")
   const resFinals = summarizeNormalizedUniversal(Object.values(stats.final.raw), 7, false, "FINAL_QUESTIONS") 
  stats.final.aggregated = resFinals
  stats.final.aggregatedPref = finalSelectMetric.pref_interface
  /* Entire */
  statistics.set(stats)
  statsCalculated.set(true)
}
