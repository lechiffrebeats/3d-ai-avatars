import type { GroundTruth, QARec } from "$lib/Evaluation/EvalSystem";
import { GAAIS_QUESTIONS } from "$lib/Evaluation/Evaluation";
import { get } from "svelte/store";
import { isPositiveGaaisLabel } from "../Haupt/GAAIS/Calc";
import { COMP_TIME_SCALE_MS } from "./HelpersCharts";
import { clamp, mean, median, metric_form_general, sd } from "./HelpersMath";
import { filterStableKeys_tasks, findOriginalQuestion } from "./Misc";
import { statistics } from "./Aggregate";

export const formatMs = (
  ms: number | string | null | undefined,
  showSeconds = true
): string => {
  const n = Number(ms)
  if (!Number.isFinite(n) || n < 0) return showSeconds ? "0s" : "0m"

  const totalSec = Math.floor(n / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60

  if (!showSeconds) {
    if (h > 0 && m === 0) return `${h}h`
    if (h > 0) return `${h}h ${m}m`
    return `${m}m`
  }

  if (h > 0) {
    if (m === 0 && s === 0) return `${h}h`
    if (s === 0) return `${h}h ${m}m`
    return `${h}h ${m}m ${s}s`
  }
  if (m > 0) {
    if (s === 0) return `${m}m`
    return `${m}m ${s}s`
  }
  return `${s}s`
}

export const pick = (re: RegExp, flat:[]) => flat.filter((e) => re.test(e.question_id))

export const formatMsBins = (ms: number) => {
  const i = COMP_TIME_SCALE_MS_NEW.findIndex(t => ms < t)
  const lo = i <= 0 ? 0 : COMP_TIME_SCALE_MS_NEW[i - 1]
  const up = COMP_TIME_SCALE_MS_NEW[i]
  if (!isFinite(up)) return `≥ ${formatMs(lo, false)}`
  if (lo === 0)       return `< ${formatMs(up, false)}`
  return `${formatMs(lo, false)} – ${formatMs(up, false)}`
}

export const COMP_TIME_SCALE_MS_NEW = [
  5,10,15,20,25,30,35,40,45,50,55,60,75,90,105,120,180
].map(m => m * 60_000).concat(Infinity)

export function getSessionById(id) {
  return get(statistics).all.aggregated.find((s) => s.session_id === id);
}

export function extractKeyDataFromSession(session) {
  const notes = []
  const prefs = []
  const tasks = []
  const flat_Eval_Questions = []
  const tasksFree = []
  const uid = session.uid
  
  for (const st of session.steps || []) {
    const et = st?.eval_type ?? "UNKNOWN"
    const full_session = session

    for (const q of st?.eval_questions || []) {
      const id = q?.id ?? q?.question_id
      const ans = typeof q?.answer === "number" ? q.answer : Number(q?.answer)
      q.session_id = full_session.session_id

      if (!Number.isFinite(ans)) {
        {if(String(id).includes("note") || String(id).includes("feedback")|| String(id).includes("issues")) {
          notes.push({ eval_type: String(et), uid, question_id: String(id), stable_key: String(st?.stable_key), min: -1, max: -1, answer: q?.answer, restData: q })
        } else {
          prefs.push({ eval_type: String(et), uid, question_id: String(id), stable_key: String(st?.stable_key), min: -1, max: -1, answer: q?.answer, restData: q })
        }}
        continue
      }
      const minv = Number.isFinite(q?.min) ? q.min : 1
      const maxv = Number.isFinite(q?.max) ? q.max : 7
      flat_Eval_Questions.push({ eval_type: String(et), question_id: String(id), stable_key: String(st?.stable_key),
         min: minv, max: maxv, answer: clamp(ans, minv, maxv), restData: q, session_id : full_session.session_id })
    }

    if (st?.isTask){
      const moddedStep = { ...st, full_session, session_id : full_session.session_id }
      if(!(filterStableKeys_tasks.includes(st?.stable_key)))
        {
        tasks.push(moddedStep)
        } else {
        tasksFree.push(moddedStep)
        }
    }
  }
  return { tasks, tasksFree, flat_Eval_Questions, notes, prefs }
}

export function getAnswer(task, qid) {
  const eq = task?.eval_questions;
  if (Array.isArray(eq)) return eq.find(x => x?.id === qid)?.answer;
  return null;
}

export function metricFrom(list, qid) {
  const answers = (list || []).map(t => getAnswer(t, qid));
  const values_x_session_id = (list || []).map(t => ({ session_id: t.session_id, answer: getAnswer(t, qid) }));
  return { mean: mean(answers), median: median(answers), sd: sd(answers), answers, values_x_session_id };
}

export function metricFromNormal(list, key) {
  const answers = (list || []).map(t => t[key] ?? null);
  return { mean: mean(answers), median: median(answers), sd: sd(answers), answers };
}

export function metricFromMetrics(list) {
  return { mean: mean(list), median: median(list), sd: sd(list)};
}

export function getAllValuesByStableKey(tasks, prop) {
  return (tasks ?? []).reduce((acc, d) => {
    const k = d?.[prop] ?? "__missing__";
    (acc[k] ||= []).push(d);
    return acc;
  }, {});
}

export const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

export const summarizeNormalizedUniversal = (rows: any[], scaleMax: number, invert: boolean = false, stable_type: string) => {
    const map : Record<string, any[]> = {}
    for (const r of rows) (map[r.question_id] ||= []).push({session_id: r.session_id, answer: r.answer})
      
    const out: Record<string, any> = {}
    for (const [id, arr] of Object.entries(map)) {
      const valsOnly = arr.map((v) => v.answer)

      const srt = [...valsOnly].sort((a, b) => a - b)
      const found = findOriginalQuestion(id, stable_type) 
      const maybeLabelKey = found?.labelKey  || ""
      const arrVals = invert
        ? srt.map(v => {
            /* console.log("invert", stable_type, invert, id, isNegativeLabelToBeReversed(id)); */
            return (isNegativeLabelToBeReversed(id) ? (scaleMax + 1) - v : v )
          }): srt
      
      const metrics = metric_form_general(arrVals, {scaleMin: 1, scaleMax: scaleMax, metric_type: invert ? "INVERTED" : "NOT_INVERTED"})
      out[id] = {labelKey: maybeLabelKey, label: id, values_x_session_id: arr, values: arrVals, id, ...metrics}
    }
    return out
}

export const summarizeQuestionMetrics = (
  arr: { session_id: string; answer: number }[],
  scaleMax: number,
  invert: boolean,
) => {
  const valsOnly = arr.map(v => v.answer)
  const srt = [...valsOnly].sort((a, b) => a - b)
  const originalValues = srt
  const arrVals = invert
    ? srt.map(v => {
        if(isNegativeLabelToBeReversed(v.question_id)) console.log(v);
        return (isNegativeLabelToBeReversed(v.question_id) ? (scaleMax + 1) - v : v )
      }): srt
  
  const metrics = metric_form_general(arrVals, {
    scaleMin: 1,
    scaleMax,
    metric_type: invert ? "INVERTED" : "NOT_INVERTED",
  })

  return {
  /*   labelKey: maybeLabelKey,
    label: stable_key, */
    values_x_session_id: arr,
    originalValues,
    values: arrVals,
    ...metrics,
  }
}

export function getValuesXUid(s) {


}

export const valsModdedInt = (valTxt) => {
    switch (String(valTxt).toLowerCase()) {
      case "avatar":
        return 1;
      case "text":
        return 2;
      case "equal":
        return 3;
      case "none":
        return 4;
    }
  }


export function isNegativeLabelToBeReversed(labelKey) {
  const specialCase = labelKey && labelKey.includes("performance")
  const st = String(labelKey).split("_")[1]
  const st2 = String(st).split(".")[1]
  return (labelKey && !labelKey.includes("tlx") && st && st[0] === "n") || (labelKey && !labelKey.includes("tlx") && st2 && st2[0] === "n") || specialCase
}/* BROOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO WAS KANNST DU */

export function groupByProp(items, prop) {
  return items.reduce((acc, d) => {
    const k = d?.[prop] ?? "__missing__";
    (acc[k] ||= []).push(d);
    return acc;
  }, {});
}

export function group_by_prop_and_transform_prop(items, prop, propTransformer = (x) => x) {
   return items.reduce((acc, d) => {
    const k = d?.[prop] ?? "__missing__";
    const propTransformed = propTransformer(k);
    (acc[propTransformed] ||= []).push(d);
    return acc;
  }, {});
}

export function group_by_prop_and_transform_prop_to_count(
  items,
  prop,
  propTransformer = (x) => x,
  missing = "__missing__"
) {
  return (items ?? []).reduce((acc, d) => {
    const raw = d?.[prop];
    const k = raw == null ? missing : propTransformer(raw);
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, Object.create(null));
}

export function transformKV(input, mapKey = (k) => k, mapValue = (v) => v): any {
  if (Array.isArray(input)) {
    return input.map(([k, v]) => [mapKey(k, v), mapValue(v, k)]);
  }
  if (input && typeof input === "object") {
    const out = Object.create(null);
    for (const [k, v] of Object.entries(input)) {
      out[mapKey(k, v)] = mapValue(v, k);
    }
    return out;
  }
  return input;
}

export const extract_number_from_time = (x) => Number(x.replace(/[^0-9]/g, ""))

export const niceLabel = (v: string, r = "") => {
  if (r) v = v.replace(new RegExp(escapeRegExp(r), "gi"), "")
  return v
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\p{L}/gu, (l) => l.toUpperCase())
}

export function calcAllTaskCorrectness(filledTasks = []) {
  const numberCorrect = filledTasks.filter(t => calcTaskCorrectness(t) === "CORRECT").length;
  const numberUnanswered = filledTasks.filter(t => calcTaskCorrectness(t) === "UNANSWERED").length;

  const total = filledTasks.length;
  const numberIncorrect = total - numberCorrect;
  const percentageCorrect = total ? (numberCorrect / total) * 100 : 0;

  /* Updateing user data from here  */
  const values_x_session_id = filledTasks.map(t => ({ session_id: t.session_id, answer: calcTaskCorrectness(t) }));

  return { percentageCorrect, numberCorrect, numberIncorrect, numberUnanswered, total, values_x_session_id };
}

export function calcTaskCorrectness(task) {
  if(!task?.isTask) return "UNANSWERED";
  const ground: GroundTruth = task?.ground;
  const anwser: QARec = task?.answers?.task;

  if(!task?.answers ||!anwser) {
      return "UNANSWERED";
  }
  
  /* MEHR GEIBT ES NCIHT */
  switch (ground?.mode) {
    case "exact": /* das ist select! */
      return anwser.user_select === ground?.values[0] ? "CORRECT" : "INCORRECT";
    case "number":
       const truth = ground.values[0]
      const a = Number(anwser.user_text);
      const b = Number(truth);
      return (Number.isFinite(a) && Number.isFinite(b) && a === b) ? "CORRECT" : "INCORRECT";
    case "date_dm":
      const oldCheck = anwser.user_day === ground?.day && anwser.user_month === ground?.month;
      return (oldCheck || ground?.values.includes(anwser.user_text)) ? "CORRECT" : "INCORRECT"; /* BRUH */
    default:
      console.log("THIS SHOUDL NOT HAPPEN");
      return "UNANSWERED";
  }
}
