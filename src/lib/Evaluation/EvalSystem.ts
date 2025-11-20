import { get, writable } from "svelte/store";
import {
  DEMO_QUESTIONS,
  EVAL_QUESTIONS,
  EVAL_TYPE,
  LOS_STEP,
  NASA_TLX_TEXT,
  STATIC_CURR_BREAK,
  STATIC_CURR_FINAL,
  STATIC_CURR_START,
  STATIC_CURR_STEPS_AVATAR,
  STATIC_CURR_STEPS_TEXT,
  STATIC_GAAIS
} from "./Evaluation";
import { goto } from "$app/navigation";
import { AVATAR_COLOR, TEXT_COLOR } from "$lib/Agent/Logic/Static";
import { chatStore, messageStore } from "$lib/User/chatStore";
import { generalStore } from "$lib/Misc/generalStore";
import { get_avatar_gender } from "$lib/Misc/sessionStore";
import { page } from "$app/state";
import { isMobile } from "$lib/Misc/about/device";

/* labelKey/hintKey/leftHintKey/rightHintKey + option.labelKey */
/* ──────────────────────────────────────────────────────────────────────────
   CONSTANTS & STORES
   ────────────────────────────────────────────────────────────────────────── */

export const evalPosition = writable({ left: 440, top: 80 });
export const LIKERT_MIN = 1;
export const LIKERT_MAX = 7;

export const evalMiscStore = writable({
  active: false,
  hasProgress: false,
  session: null,
  SHOW_SENDING: false,
  SHOW_THANKYOU: false,
  eval_type: EVAL_TYPE.TEXT /* AB or BA */
});

export const missing_property = writable<{ id: string } | null>(null);

/* aliases/enums */
export type HISTAR_INPUT_TYPES = "text" | "mic" | "video" | "date_dm";
export type QType = "likert" | "text" | "checklist" | "select";
export type EVAL_ORDERS = "AB" | "BA";

export const hasAgreedToEval = writable(false);
export const submittedEval = writable(false);
export const skippedBreakEval = writable(false);
export const currEvalType = writable<null | EVAL_TYPE>(null);
export const alreadySwitched = writable(false);
export const globalWarnMessage = writable({
  message: "",
  detail: "",
  info: {},
  show: false
});
export const isSubmitting = writable(false);
export const eval_session_initialized = writable(false);
/* $session.currStep */
/* ──────────────────────────────────────────────────────────────────────────
   TYPES – now with i18n key support
   ────────────────────────────────────────────────────────────────────────── */

export type ChecklistOption = {
  id: string;
  label?: string;       // legacy
  labelKey?: string;    // i18n
  required?: boolean;
  value?: boolean;
};

export type QARec = {
  user_text?: string;
  user_select?: string | string[] | null;
  user_range?: { from: string; to: string };
  user_day?: number;
  user_month?: number;

  success?: boolean;
  matched?: string;
};

export type StepComponentKey =
  | "StepFinal"
  | "Template"
  | "StepStart"
  | "StepInfo"
  | "StepDemo"
  | "StepTimer"
  | "StepLos"
  | "StepTalkFree";

export type TaskUI =
  | { type: "text"; placeholder?: string; placeholderKey?: string }
  | { type: "number"; suffix?: string }
  | { type: "email" }
  | {
      type: "date_dm";
      dayLabel?: string;
      monthLabel?: string;
      dayLabelKey?: string;
      monthLabelKey?: string;
    }
  | {
      type: "select";
      multiple?: boolean;
      options: { id: string; label?: string; labelKey?: string }[];
    };

export type GroundTruth =
  | { mode: "exact"; values: string[] }
  | { mode: "number"; values: number[] }
  | { mode: "date_dm"; values: string[], day: number, month: number }
  | { mode: "email"; value: string }
  | { mode: "set"; values: string[]; requireAll?: boolean; min?: number };

export type Question = {
  id: string;
  type: QType;

  label?: string;
  labelKey?: string;

  hint?: string;
  hintKey?: string;

  leftHint?: string;
  leftHintKey?: string;

  rightHint?: string;
  rightHintKey?: string;

  ui?: TaskUI;
  options?: ChecklistOption[];
  required?: boolean;
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
  answer?: string | number | string[] | null;
};

export type Step = {
  stable_key:string; /* UNUQZUE KEY FOR ANLYSIS LATER */
  uid?: string;
  step_id: number; /* this is mixed up bewtweeen ab ba not for later uss */
  component?: StepComponentKey;

  title?: string;
  titleKey?: string;

  subtitle?: string;
  subtitleKey?: string;

  dontShowReplyField?: boolean;
  ui?: TaskUI;
  link?: { url: string; title?: string; titleKey?: string };
  eval_type: EVAL_TYPE;

  showTitleBigInside?: boolean;
  titleBigInside?: string;
  showSubtitle?: boolean;
  isTask?: boolean;

  task?: string | null;
  taskKey?: string;

  answers?: Record<string, QARec>;
  ground?: GroundTruth;
  meta: { soundOn: boolean; input: HISTAR_INPUT_TYPES; specs?: string, msg_count_user?: number, msg_count_system?: number };
  eval_questions: Question[];
  demo_questions?: Question[];

  duration?: number;
};

export type Session = {
  eval_id: string | null;
  inited: boolean;
  currColor: any;
  order: EVAL_ORDERS | null;
  currStep: number;
  curr_eval_type: EVAL_TYPE | null;
  prevStep: number;
  messages: any[];
  steps: Step[];
  questionary_demo: any;
  meta: {
    soundOn: boolean;
    input: HISTAR_INPUT_TYPES;
    avatar_gender: "male" | "female";
    lang: string;
    msg_count: number;
    isMobile: boolean;
    utm_source: string;
  };
  timings: Record<number, { start?: number; end?: number; dur?: number }>;
};

/* ──────────────────────────────────────────────────────────────────────────
   UTILS
   ────────────────────────────────────────────────────────────────────────── */

function gid() {
  return Math.random().toString(36).slice(2) + "-" + Date.now().toString(36);
}
export function clone<T>(x: T): T {
  return typeof structuredClone === "function"
    ? structuredClone(x)
    : JSON.parse(JSON.stringify(x));
}

const shuffle = <T>(a: T[]) => {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
};

function applyOrder<T>(items: T[], order: number[]): T[] {
  const out: T[] = [];
  for (const i of order) if (i >= 0 && i < items.length) out.push(items[i]);
  return out;
}

const randQs = (qs: any[]) => {
  const rest = qs.filter((q: any) => q.id !== "note" && q.type !== "text");
  const notes = qs.filter((q: any) => q.id === "note" || q.type === "text");
  return [...shuffle(rest), ...notes];
};

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

/* ──────────────────────────────────────────────────────────────────────────
  anders wege  i18n
   ────────────────────────────────────────────────────────────────────────── */

function getStepTitleId(s: Step): string {
  return s.titleKey ?? s.title ?? "";
}

export function isBreakStep(s: Step): boolean {
  const t = getStepTitleId(s);
  if (!t) return false;
  return t === "steps.break.title" || s.title === "Pause";
}

function isGaaisStep(s: Step): boolean {
  const t = getStepTitleId(s);
  return t.startsWith("steps.gaais") || (s.title ?? "").includes("GAAIS");
}

function isNasaStep(s: Step): boolean {
  const t = getStepTitleId(s);
  return t.startsWith("steps.nasa.") || (s.title ?? "").includes("NASA-TLX");
}

/* ──────────────────────────────────────────────────────────────────────────
   BUILD SEQUENCES (AB / BA) mit i18n
   ────────────────────────────────────────────────────────────────────────── */

function map_a_b_Condition(type: EVAL_TYPE) {
  const template =
    type === EVAL_TYPE.TEXT
      ? STATIC_CURR_STEPS_TEXT
      : STATIC_CURR_STEPS_AVATAR;

  return template.map((origStep) => {
    const s = clone(origStep);
    s.eval_type = type;
    const hasOwn =
      Array.isArray(s.eval_questions) && s.eval_questions.length > 0;
    s.eval_questions = hasOwn
      ? s.eval_questions.map(clone)
      : clone(EVAL_QUESTIONS);
    return s;
  });
}

/**
 * Assemble full sequence:
 * - Start intro
 * - GAAIS (shuffled INSIDE once)
 * - LOS A
 * - first half (AB or BA)
 * - TLX RAW TEXT, auch geschuffelt 1X
 * - Pause
 * - LOS B
 * - second half
 * - TLX RAW TEXT gleiche shuffelung wie bei 1.
 * - Final
 * NOTE:
 * - For each step with eval_questions, non-text questions are shuffled, text/note kept last
 */
function assemble(order: EVAL_ORDERS) {
  const intro = clone(STATIC_CURR_START);
  const pause = [clone(STATIC_CURR_BREAK)];
  const losA = clone(LOS_STEP);
  const losB = clone(LOS_STEP);
  const fin = clone(STATIC_CURR_FINAL);

  const gaaisStep = clone(STATIC_GAAIS);
  if (
    Array.isArray(gaaisStep.eval_questions) &&
    gaaisStep.eval_questions.length
  ) {
    gaaisStep.eval_questions = shuffle(clone(gaaisStep.eval_questions));
  }

  const tlxLen = NASA_TLX_TEXT.length; 
  const tlxOrder = shuffle([...Array(tlxLen).keys()]);

  const first =
    order === "AB"
      ? map_a_b_Condition(EVAL_TYPE.AVATAR)
      : map_a_b_Condition(EVAL_TYPE.TEXT);
  const second =
    order === "AB"
      ? map_a_b_Condition(EVAL_TYPE.TEXT)
      : map_a_b_Condition(EVAL_TYPE.AVATAR);

  const seq = [
    ...intro,
    gaaisStep,
    losA,
    ...first,
    ...pause,
    losB,
    ...second,
    ...fin
  ].map((s, i) => ({ ...s, uid: gid(), step_id: i }));

  seq.forEach((s: Step) => {
    if (isGaaisStep(s)) return;

    if (isNasaStep(s) && Array.isArray(s.eval_questions) && s.eval_questions.length === tlxLen) {
      s.eval_questions = applyOrder(clone(s.eval_questions), tlxOrder);
      return;
    }

    if (Array.isArray(s.eval_questions) && s.eval_questions.length) {
      s.eval_questions = randQs(s.eval_questions);
    }
  });
  /* einmal in gias step vermekten ab oder ba */

  return seq;
}

/* ──────────────────────────────────────────────────────────────────────────
   SESSION
   ────────────────────────────────────────────────────────────────────────── */

export const session = writable<Session>({
  eval_id: null,
  order: null,
  inited: false,
  currColor: AVATAR_COLOR,
  currStep: 0,
  prevStep: 0,
  steps: [],
  meta: { soundOn: false, input: "text", avatar_gender: "male", lang: "en", utm_source: "", msg_count: 0},
  timings: {},
  questionary_demo: null,
  curr_eval_type: null,
  messages: []
});

export const random_id = () => gid();

export function setOrderAndRebuild(order: EVAL_ORDERS) {
  const currColor = order === "AB" ? AVATAR_COLOR : TEXT_COLOR;

  session.update((s) => {
    const steps = assemble(order);
    const userLang = get(chatStore).userLanguage?.toLowerCase() ?? "en";
    return {
      ...s,
      eval_id: random_id(),
      inited: true,
      order,
      steps,
      currColor,
      currStep: 0,
      prevStep: 0,
      timings: {},
      messages: [],
      questionary_demo: clone(DEMO_QUESTIONS),
      curr_eval_type: order === "AB" ? EVAL_TYPE.AVATAR : EVAL_TYPE.TEXT,
      meta: { ...s.meta, avatar_gender: get_avatar_gender(), lang: userLang}
    };
  });
}

/* ──────────────────────────────────────────────────────────────────────────
   GETTERS
   ────────────────────────────────────────────────────────────────────────── */

export function getStep(s: Session, idx: number) {
  return s.steps[idx];
}

function getQuestion(s: Session, stepIndex: number, qid: string) {
  const st = s.steps[stepIndex];
  return st?.eval_questions.find((q) => q.id === qid);
}

/* ──────────────────────────────────────────────────────────────────────────
   SETTERS
   ────────────────────────────────────────────────────────────────────────── */

export function setLikertNew(stepIndex: number, qid: string, value: number) {
  session.update((s) => {
    const steps = [...s.steps];
    const step = steps[stepIndex];
    if (!step || !Array.isArray(step.eval_questions)) return s;

    const idx = step.eval_questions.findIndex(
      (q) => q.id === qid && q.type === "likert"
    );
    if (idx !== -1) {
      const q = { ...step.eval_questions[idx], answer: value };
      const qs = [...step.eval_questions];
      qs[idx] = q;
      steps[stepIndex] = { ...step, eval_questions: qs };
      return { ...s, steps };
    }
    return s;
  });
}

/* ──────────────────────────────────────────────────────────────────────────
   VALIDATION
   ────────────────────────────────────────────────────────────────────────── */

export function isQuestionFilled(q: Question): boolean {
  const required = q.required ?? (q.type === "likert" || q.type === "select");
  if (!required) return true;

  switch (q.type) {
    case "likert":
      return typeof q.answer === "number" && Number.isFinite(q.answer);

    case "select":
      if (Array.isArray(q.answer)) return q.answer.length > 0;
      if (typeof q.answer === "number") return Number.isFinite(q.answer);
      if (typeof q.answer === "string") return q.answer.trim() !== "";
      return !!q.answer;

    case "text":
      return true;

    default:
      return !!q.answer;
  }
}

export function isStepValid(s: Session, stepIndex: number): boolean {
  const st = s.steps[stepIndex];
  if (!st) return false;
  const qs = st.eval_questions ?? [];
  if (qs.length === 0) return true;

  for (const q of qs) {
    if (!isQuestionFilled(q)) {
      missing_property.set({ id: q.id });
      if (typeof document !== "undefined") {
        queueMicrotask(() => {
          const el =
            document.querySelector<HTMLElement>(`[data-qid="${q.id}"]`);
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
          (el?.querySelector<HTMLElement>("[data-focus]") ?? el)?.focus?.();
        });
      }
      return false;
    }
  }
  missing_property.set(null);
  return true;
}

export function validateAllSteps(s: Session): {
  ok: boolean;
  firstBad?: { index: number; title: string };
} {
  for (let i = 0; i < s.steps.length; i++) {
    const st = s.steps[i];
    const hasQs = (st?.eval_questions?.length ?? 0) > 0;
    if (!hasQs) continue;
    if (!isStepValid(s, i)) {
      const titleLike = st.title ?? st.titleKey ?? `#${i + 1}`;
      return { ok: false, firstBad: { index: i, title: titleLike } };
    }
  }
  return { ok: true };
}

/* ──────────────────────────────────────────────────────────────────────────
   NAVIGATION & TIMING
   ────────────────────────────────────────────────────────────────────────── */

function startTiming(s: Session, step_id: number) {
  const t = (s.timings[step_id] ||= {});
  if (!t.start) t.start = Date.now();
}
function endTiming(s: Session, step_id: number) {
  const t = (s.timings[step_id] ||= {});
  if (!t.start) return;
  t.end = Date.now();
  t.dur = t.end - t.start;
  s.steps[step_id].duration = t.dur;
}

export function gotoStep(step: number) {
  session.update((s) => {
    const t = clamp(step, 0, s.steps.length - 1);
    endTiming(s, s.currStep);
    s.prevStep = s.currStep;
    s.messages = get(messageStore);
    s.currStep = t;
    startTiming(s, s.currStep);
    writeStepToUrl(s.currStep);
    return s;
  });
}

let buildingEvalSession = false;
export async function startEval() {
  if (buildingEvalSession) return;
  if (get(eval_session_initialized)) return;
  buildingEvalSession = true;

  const res = await fetch("/histarBackend/get_session_order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({})
  });

  const { session_order } = await res.json();
  setOrderAndRebuild(session_order);
  currEvalType.set(
    session_order === "AB" ? EVAL_TYPE.AVATAR : EVAL_TYPE.TEXT
  );

  const url = new URL(window.location.href);
  url.searchParams.set("evalStep", String(0));
  url.searchParams.set("evalOrder", String(session_order));
  window.history.replaceState({}, "", url);
  generalStore.update((s) => ({ ...s, EVAL_MODE: true, SHOW_EVALUATE: true }));
  eval_session_initialized.set(true);
  console.log("Evaluation constructed: "/* , get(session),get(chatStore) */);
  buildingEvalSession = false;
}

export function next(gotoEval = false) {
  const url = new URL(window.location.href);
  if (!url.pathname.startsWith("/evaluation") && gotoEval) {
    goto("/evaluation" + url.search);
    return;
  }
  const s = get(session);
  const ok = isStepValid(s, s.currStep);
  if (!ok && !page.url.hostname.startsWith("localhost")) {
    alert("Please answer all necessary questions 🙏.");
    return;
  }
  const newStep = s.currStep + 1;
  gotoStep(newStep);
}

export function prev() {
  session.update((s) => {
    const curr = s.steps[s.currStep];
    if (isBreakStep(curr) || s.currStep === 1) return s;
    const preStep= s.currStep - 1;
    gotoStep(preStep);
    return s;
  });
}

/* URL helpers */
export function resetURL() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.delete("evalStep");
  url.searchParams.set("mode", "SUBMITTED");
  window.history.replaceState({}, "", url);
}

export function writeStepToUrl(step: number) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.set("evalStep", String(step));
  window.history.replaceState({}, "", url);
}

/* ──────────────────────────────────────────────────────────────────────────
   EXPORT / SHARING
   ────────────────────────────────────────────────────────────────────────── */

export function exportAnswers(s: Session) {
  console.log("exportAnswers", s);
  const out: Record<string, any> = {};
  for (const st of s.steps) {
    for (const q of st.eval_questions) {
      out[q.id] = q.answer ?? null;
    }
  }

  const json = JSON.stringify(s, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `answers-${new Date().toISOString()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return out;
}

/* ──────────────────────────────────────────────────────────────────────────
   MISC INPUT SETTERS
   ────────────────────────────────────────────────────────────────────────── */

export function setText(stepIndex: number, qid: string, v: string) {
  session.update((s) => {
    const t = s.steps[stepIndex];
    t.answers = {
      ...(t.answers || {}),
      [qid]: { ...(t.answers?.[qid] || {}), user_text: v }
    };
    return s;
  });
}

export function setSelect(stepIndex: number, qid: string, id: string) {
  session.update((s) => {
    const t = s.steps[stepIndex];
    t.answers = {
      ...(t.answers || {}),
      [qid]: { ...(t.answers?.[qid] || {}), user_select: id }
    };
    return s;
  });
}

export function setSelectMulti(stepIndex: number, qid: string, ids: string[]) {
  session.update((s) => {
    const t = s.steps[stepIndex];
    t.answers = {
      ...(t.answers || {}),
      [qid]: { ...(t.answers?.[qid] || {}), user_select: ids }
    };
    return s;
  });
}

export function setRange(
  stepIndex: number,
  qid: string,
  from: string,
  to: string
) {
  session.update((s) => {
    const t = s.steps[stepIndex];
    t.answers = {
      ...(t.answers || {}),
      [qid]: { ...(t.answers?.[qid] || {}), user_range: { from, to } }
    };
    return s;
  });
}

/* Date(Day/Month) */
const two = (n: number) => (n < 10 ? `0${n}` : String(n));
const toInt = (x: unknown) => {
  const n = typeof x === "number" ? x : parseInt(String(x), 10);
  return Number.isFinite(n) ? n : null;
};

export function setDateDM(
  stepIndex: number,
  answerKey: string, // immer  "task"
  day: number | string | null | undefined,
  month: number | string | null | undefined
) {
  session.update((s) => {
    const st = s?.steps?.[stepIndex];
    if (!st) return s;

    const d0 = toInt(day);
    const m0 = toInt(month);
    const d = d0 != null ? clamp(d0, 1, 31) : null;
    const m = m0 != null ? clamp(m0, 1, 12) : null;

    const user_text = d && m ? `${two(d)}.${two(m)}` : "";

    st.answers = st.answers ?? {};
    st.answers[answerKey] = {
      ...(st.answers[answerKey] || {}),
      user_day: d,
      user_month: m,
      user_text
    };

    return s;
  });
}

export const setDateDMTask = (
  stepIndex: number,
  day: number | string | null | undefined,
  month: number | string | null | undefined
) => setDateDM(stepIndex, "task", day, month);

/* ──────────────────────────────────────────────────────────────────────────
   SUBMISSION
   ────────────────────────────────────────────────────────────────────────── */

export function validateSubmission(): boolean {
  const s = get(session);
  const { ok, firstBad } = validateAllSteps(s);
  if (!ok) {
    globalWarnMessage.set({
      message: "Please answer all necessary questions 🙏.",
      detail: JSON.stringify(firstBad),
      info: {},
      show: true
    });
    return false;
  }
  return true;
}

export async function submitSession() {
  isSubmitting.set(true);
  evalMiscStore.update((x) => ({ ...x, SHOW_SENDING: true }));
  if (!validateSubmission()) {
    alert("Please answer all necessary questions 🙏.");
    isSubmitting.set(false);
    evalMiscStore.update((x) => ({
      ...x,
      SHOW_SENDING: false,
      SHOW_THANKYOU: false
    }));
    return;
  }

  submittedEval.set(true);

  const s = get(session);
  s.questionary_demo = s.questionary_demo;
  s.meta.avatar_gender = s.meta?.avatar_gender || get_avatar_gender();
  s.meta.msg_count = s.messages?.length || 0; /* für resutls soäter */
  s.meta.isMobile = get(isMobile)

  const fd = new FormData();
  fd.append("session", JSON.stringify(s));

  const res = await fetch("/histarBackend/submit_session", {
    method: "POST",
    body: fd
  });

  if (!res.ok) {
    console.error("submit failed!", await res.text());
    submittedEval.set(false);
    isSubmitting.set(false);
    evalMiscStore.update((x) => ({
      ...x,
      SHOW_SENDING: false,
      SHOW_THANKYOU: false
    }));
    return;
  }

  setTimeout(() => {
    evalMiscStore.update((x) => ({ ...x, SHOW_SENDING: false, SHOW_THANKYOU: true }));
  }, 3000);

  setTimeout(() => {
    isSubmitting.set(false);
    submittedEval.set(true);
    reset_eval_session();
    resetURL();
    generalStore.update((st) => ({ ...st, EVAL_MODE: false }));
    evalMiscStore.update((x) => ({
      ...x,
      SHOW_SENDING: false,
      SHOW_THANKYOU: false
    }));
    goto("/Results"); /* das sollte reichen */
  }, 5000);
}

export function reset_eval_session() {
  session.set({
    order: null,
    inited: false,
    currColor: AVATAR_COLOR,
    currStep: 0,
    prevStep: 0,
    eval_id: null,
    steps: assemble("AB"),
    meta: { soundOn: false, input: "text", avatar_gender: get_avatar_gender(), lang: "en", msg_count: 0, isMobile: get(isMobile), utm_source: "" },
    timings: {},
    questionary_demo: null,
    curr_eval_type: null,
    messages: []
  });
}
