import type { Step } from "./EvalSystem";

export enum EVAL_TYPE {
  AVATAR = "AVATAR",
  TEXT = "TEXT",
}

export function get_stable_key_by_id(id): string {
  return "1"
}

export const STABLE_KEY_LABELS = {
  "start-welcome-v1": "Welcome",
  "start-info-v1": "Info",
  "start-demo-v1": "Demographics",

  "gaais-block-v1": "GAAIS (1–5)",

  "break-v1": "Break",
  "letsgo-v1": "Let’s Go",

  "avatar-task-ws-deadline-v1": "WS Deadline (A)",
  "avatar-task-thesis-cp-v1": "Thesis CP (A)",
  "avatar-task-msc-eligibility-test-v1": "MSc Eligibility (A)",
  "avatar-free-interaction-v1": "Free Chat (A)",
  "avatar-tlx-v1": "NASA-TLX (A)",
  "avatar-variant-rate-v1": "Variant Rating (A)",

  "text-task-ss-deadline-v1": "SS Deadline (T)",
  "text-task-master-total-cp-v1": "Master CP (T)",
  "text-task-ml-prereq-v1": "ML Prereq (T)",
  "text-free-interaction-v1": "Free Chat (T)",
  "text-tlx-v1": "NASA-TLX (T)",
  "text-variant-rate-v1": "Variant Rating (T)",

  "final-questionnaire-v1": "Final Survey"
} as const;

/* DO NOT EVER CHAGNE stable key !!!!!!!!!!!!!!!!!!!!!!!!!!! */
export const DEMO_QUESTIONS = {
  demo_age: null as number | null,
  demo_gender: "" as "" | "male" | "female" | "diverse" | "no_answer",
  demo_status: "" as "" | "bachelor" | "master" | "doctoral" | "alumni" | "external" | "no_answer",
  demo_ai_experience: null as number | null,
  demo_lang_level: "" as "" | "native" | "C2" | "C1" | "B2" | "B1_or_lower" | "no_answer",
  demo_device: "" as "" | "desktop" | "laptop" | "tablet" | "smartphone" | "no_answer",
  demo_domain_familiarity: null as number | null
};

export const EVAL_QUESTIONS = [
  { id: "clarity",      type: "likert", labelKey: "evaltaskq.common.clarity",      min: 1, max: 7, required: true,  answer: null },
  { id: "correctness",  type: "likert", labelKey: "evaltaskq.common.correctness",  min: 1, max: 7,                  answer: null },
  { id: "credibility",  type: "likert", labelKey: "evaltaskq.common.credibility",  min: 1, max: 7,                  answer: null },
  { id: "usefulness",   type: "likert", labelKey: "evaltaskq.common.usefulness",   min: 1, max: 7,                  answer: null },
  { id: "note",         type: "text",   labelKey: "evaltaskq.common.note",                                             answer: ""  }
];

/* https://figshare.com/articles/online_resource/General_Attitudes_towards_Artificial_Intelligence_Scale_GAAIS_20_items_by_Astrid_Schepman_and_Paul_Rodway/27073942 */
export const GAAIS_QUESTIONS = [
  { id: "gaais_p01", type: "likert", labelKey: "gaais.p01", min: 1, max: 5, required: true, answer: null },
  { id: "gaais_p02", type: "likert", labelKey: "gaais.p02", min: 1, max: 5, required: true, answer: null },
  { id: "gaais_n03", type: "likert", labelKey: "gaais.n03", min: 1, max: 5, required: true, answer: null },
  { id: "gaais_p04", type: "likert", labelKey: "gaais.p04", min: 1, max: 5, required: true, answer: null },
  { id: "gaais_p05", type: "likert", labelKey: "gaais.p05", min: 1, max: 5, required: true, answer: null },
  { id: "gaais_n06", type: "likert", labelKey: "gaais.n06", min: 1, max: 5, required: true, answer: null },
  { id: "gaais_p07", type: "likert", labelKey: "gaais.p07", min: 1, max: 5, required: true, answer: null },
  { id: "gaais_n08", type: "likert", labelKey: "gaais.n08", min: 1, max: 5, required: true, answer: null },
  { id: "gaais_n09", type: "likert", labelKey: "gaais.n09", min: 1, max: 5, required: true, answer: null },
  { id: "gaais_n10", type: "likert", labelKey: "gaais.n10", min: 1, max: 5, required: true, answer: null },
  { id: "gaais_p11", type: "likert", labelKey: "gaais.p11", min: 1, max: 5, required: true, answer: null },
  { id: "gaais_p12", type: "likert", labelKey: "gaais.p12", min: 1, max: 5, required: true, answer: null },
  { id: "gaais_p13", type: "likert", labelKey: "gaais.p13", min: 1, max: 5, required: true, answer: null },
  { id: "gaais_p14", type: "likert", labelKey: "gaais.p14", min: 1, max: 5, required: true, answer: null },
  { id: "gaais_n15", type: "likert", labelKey: "gaais.n15", min: 1, max: 5, required: true, answer: null },
  { id: "gaais_p16", type: "likert", labelKey: "gaais.p16", min: 1, max: 5, required: true, answer: null },
  { id: "gaais_p17", type: "likert", labelKey: "gaais.p17", min: 1, max: 5, required: true, answer: null },
  { id: "gaais_p18", type: "likert", labelKey: "gaais.p18", min: 1, max: 5, required: true, answer: null },
  { id: "gaais_n19", type: "likert", labelKey: "gaais.n19", min: 1, max: 5, required: true, answer: null },
  { id: "gaais_n20", type: "likert", labelKey: "gaais.n20", min: 1, max: 5, required: true, answer: null }
];

/* https://germanupa.de/wissen/fragebogenmatrix/nasa-tlx */
export const NASA_TLX_TEXT = [
  { id: "B_tlx_mental",      type: "likert", labelKey: "nasa.mental",      min: 1, max: 7, leftHintKey: "nasa.low",  rightHintKey: "nasa.high",  answer: null },
  { id: "B_tlx_physical",    type: "likert", labelKey: "nasa.physical",    min: 1, max: 7, leftHintKey: "nasa.low",  rightHintKey: "nasa.high",  answer: null },
  { id: "B_tlx_temporal",    type: "likert", labelKey: "nasa.temporal",    min: 1, max: 7, leftHintKey: "nasa.none", rightHintKey: "nasa.strong",answer: null },
  { id: "B_tlx_performance", type: "likert", labelKey: "nasa.performance", min: 1, max: 7, leftHintKey: "nasa.perf", rightHintKey: "nasa.fail",  answer: null },
  { id: "B_tlx_effort",      type: "likert", labelKey: "nasa.effort",      min: 1, max: 7, leftHintKey: "nasa.veryLow", rightHintKey: "nasa.veryHigh", answer: null },
  { id: "B_tlx_frustr",      type: "likert", labelKey: "nasa.frustration", min: 1, max: 7, leftHintKey: "nasa.none", rightHintKey: "nasa.strong",answer: null }
];

/* https://germanupa.de/wissen/fragebogenmatrix/nasa-tlx */
export const NASA_TLX_AVATAR = [
  { id: "A_tlx_mental",      type: "likert", labelKey: "nasa.mental",      min: 1, max: 7, leftHintKey: "nasa.low",  rightHintKey: "nasa.high",  answer: null },
  { id: "A_tlx_physical",    type: "likert", labelKey: "nasa.physical",    min: 1, max: 7, leftHintKey: "nasa.low",  rightHintKey: "nasa.high",  answer: null },
  { id: "A_tlx_temporal",    type: "likert", labelKey: "nasa.temporal",    min: 1, max: 7, leftHintKey: "nasa.none", rightHintKey: "nasa.strong",answer: null },
  { id: "A_tlx_performance", type: "likert", labelKey: "nasa.performance", min: 1, max: 7, leftHintKey: "nasa.perf", rightHintKey: "nasa.fail",  answer: null },
  { id: "A_tlx_effort",      type: "likert", labelKey: "nasa.effort",      min: 1, max: 7, leftHintKey: "nasa.veryLow", rightHintKey: "nasa.veryHigh", answer: null },
  { id: "A_tlx_frustr",      type: "likert", labelKey: "nasa.frustration", min: 1, max: 7, leftHintKey: "nasa.none", rightHintKey: "nasa.strong",answer: null }
];

export const VARIANT_RATE_AVATAR = [
  { id: "A_vr_presence", type: "likert", labelKey: "steps.variant_rate.avatar.items.presence", min: 1, max: 7, answer: null },
  { id: "A_vr_natural",  type: "likert", labelKey: "steps.variant_rate.avatar.items.natural",  min: 1, max: 7, answer: null },
  { id: "A_vr_likeable", type: "likert", labelKey: "steps.variant_rate.avatar.items.likeable", min: 1, max: 7, answer: null },
  { id: "A_vr_enjoy",    type: "likert", labelKey: "steps.variant_rate.avatar.items.enjoy",    min: 1, max: 7, answer: null },
  { id: "A_vr_note",     type: "text",   labelKey: "steps.variant_rate.avatar.note",    answer: null }
];


export const VARIANT_RATE_TEXT = [
  { id: "B_vr_presence", type: "likert", labelKey: "steps.variant_rate.text.items.presence", min: 1, max: 7, answer: null },
  { id: "B_vr_natural",  type: "likert", labelKey: "steps.variant_rate.text.items.natural",  min: 1, max: 7, answer: null },
  { id: "B_vr_likeable", type: "likert", labelKey: "steps.variant_rate.text.items.likeable", min: 1, max: 7, answer: null },
  { id: "B_vr_enjoy",    type: "likert", labelKey: "steps.variant_rate.text.items.enjoy",    min: 1, max: 7, answer: null },
  { id: "B_vr_note",     type: "text",   labelKey: "steps.variant_rate.text.note",    answer: null }
];

export const STATIC_CURR_BREAK: Step = {
  stable_key: "break-v1",
  step_id: 0,
  component: "StepTimer",
  titleKey: "steps.break.title",
  showSubtitle: true,
  eval_type: EVAL_TYPE.TEXT,
  subtitleKey: "steps.break.subtitle",
  isTask: false,
  task: null,
  meta: { soundOn: true, input: "text", specs: "Überzeugungskraft" },
  eval_questions: []
};

export const LOS_STEP: Step = {
  stable_key: "letsgo-v1",  
  step_id: 3,
  component: "StepLos",
  eval_type: EVAL_TYPE.TEXT,
  titleKey: "steps.letsgo.title",
  showSubtitle: true,
  isTask: false,
  subtitleKey: "steps.letsgo.subtitle",
  task: null,
  meta: { soundOn: true, input: "text", specs: "" },
  eval_questions: []
};

export const STATIC_CURR_START: Step[] = [
  {
    stable_key: "start-welcome-v1",
    step_id: 0, component: "StepStart", eval_type: EVAL_TYPE.TEXT, titleKey: "steps.start.title",
    showSubtitle: true, isTask: false, subtitleKey: "steps.start.subtitle",
    task: "", meta: { soundOn: true, input: "text", specs: "Start-Check" }, eval_questions: []
  },
  {
    stable_key: "start-info-v1",
    step_id: 1, component: "StepInfo",  eval_type: EVAL_TYPE.TEXT, titleKey: "steps.info.title",
    showSubtitle: true, isTask: false, subtitleKey: "steps.info.subtitle",
    task: "", meta: { soundOn: true, input: "text", specs: "" }, eval_questions: []
  },
  {
    stable_key: "start-demo-v1",
    step_id: 2, component: "StepDemo",  eval_type: EVAL_TYPE.TEXT, titleKey: "steps.demo.title",
    showSubtitle: true, isTask: false, subtitleKey: "steps.demo.subtitle", demo_questions: [],
    task: null, meta: { soundOn: true, input: "text", specs: "" }, eval_questions: []
  }
]

export const STATIC_GAAIS: Step = {
  stable_key: "gaais-block-v1",
  step_id: 0,
  component: "Template",
  eval_type: EVAL_TYPE.TEXT,
  titleKey: "steps.gaais.title",
  showSubtitle: false,
  isTask: false,
  link: {
    url: "https://www.tandfonline.com/doi/full/10.1080/10447318.2022.2085400",
    title: "steps.gaais.title"
  },
  subtitleKey: "steps.gaais.subtitle",
  task: null,
  meta: { soundOn: false, input: "text", specs: "GAAIS (Likert 1–5)" },
  eval_questions: GAAIS_QUESTIONS
}

export const STATIC_CURR_STEPS_AVATAR: Step[] = [
  {
    stable_key: "avatar-task-ws-deadline-v1",
    step_id: 0, component: "Template",
    titleKey: "steps.avatar.0.title", subtitleKey: "steps.common.subtitleTask",
    showSubtitle: true, eval_type: EVAL_TYPE.AVATAR, isTask: true,
    taskKey: "steps.avatar.0.task",
    meta: { soundOn: true, input: "date_dm",  specs: "Korrektheit/Verständlichkeit" },
    eval_questions: [],
    ui: { type: "date_dm", dayLabelKey: "ui.day", monthLabelKey: "ui.month" },
    ground: { mode: "date_dm", values: ["31.05"], day: 31, month: 5 },
    answers: { task: {} }
  },
  {
    stable_key: "avatar-task-thesis-cp-v1",
    step_id: 1, component: "Template",
    titleKey: "steps.avatar.1.title", subtitleKey: "steps.common.subtitleTask",
    showSubtitle: true, eval_type: EVAL_TYPE.AVATAR, isTask: true,
    taskKey: "steps.avatar.1.task",
    meta: { soundOn: true, input: "text", specs: "Korrektheit/Verständlichkeit" },
    eval_questions: [],
    ui: { type: "number", suffix: "CP" },
    ground: { mode: "number", values: [60] },
    answers: { task: {} }
  },
  {
    stable_key: "avatar-task-msc-eligibility-test-v1",
    step_id: 2, component: "Template",
    titleKey: "steps.avatar.2.title", subtitleKey: "steps.common.subtitleTask",
    showSubtitle: true, eval_type: EVAL_TYPE.AVATAR, isTask: true,
    taskKey: "steps.avatar.2.task",
    meta: { soundOn: true, input: "text", specs: "Faktenabruf" },
    ui: {
      type: "select",
      options: [
        { id: "no_test",      labelKey: "steps.avatar.2.opt.no_test" },     // ✅ correct
        { id: "always_test",  labelKey: "steps.avatar.2.opt.always_test" },
        { id: "only_limited", labelKey: "steps.avatar.2.opt.only_limited" },
        { id: "only_non_cs",  labelKey: "steps.avatar.2.opt.only_non_cs" },
        { id: "case_by_case", labelKey: "steps.avatar.2.opt.case_by_case" }
      ]
    },
    ground: { mode: "exact", values: ["no_test"] },
    answers: { task: {} },
    eval_questions: []
  },
  {
    stable_key: "avatar-free-interaction-v1",
    step_id: 3, component: "Template",
    titleKey: "steps.common.free.title", subtitleKey: "steps.common.subtitleTask",
    showSubtitle: true, eval_type: EVAL_TYPE.AVATAR, isTask: true,
    taskKey: "steps.avatar.3.task", dontShowReplyField: true,
    meta: { soundOn: true, input: "text", specs: "Natürlichkeit" },
    eval_questions: [
      { id: "pleasant",      type: "likert", labelKey: "steps.common.free.pleasant",       min: 1, max: 7, answer: null },
      { id: "comprehension", type: "likert", labelKey: "steps.common.free.comprehension", min: 1, max: 7, answer: null }
    ]
  },
  {
    stable_key: "avatar-tlx-v1",
    step_id: 4, component: "Template",
    eval_type: EVAL_TYPE.AVATAR,
    titleKey: "steps.nasa.avatar.title",
    showSubtitle: true,
    isTask: false,
    subtitleKey: "steps.nasa.avatar.subtitle",
    task: null,
    meta: { soundOn: false, input: "text", specs: "" },
    eval_questions: NASA_TLX_AVATAR
  },
  {
    stable_key: "avatar-variant-rate-v1",
    step_id: 5, component: "Template",
    eval_type: EVAL_TYPE.AVATAR,
    titleKey: "steps.variant_rate.avatar.title",
    showSubtitle: true,
    isTask: false,
    subtitleKey: "steps.variant_rate.avatar.subtitle",
    task: null,
    meta: { soundOn: false, input: "text", specs: "" },
    eval_questions: VARIANT_RATE_AVATAR
  }
];

export const STATIC_CURR_STEPS_TEXT: Step[] = [
  {
    stable_key: "text-task-ss-deadline-v1",
    step_id: 0, component: "Template",
    titleKey: "steps.text.0.title", subtitleKey: "steps.common.subtitleTask",
    showSubtitle: true, eval_type: EVAL_TYPE.TEXT, isTask: true,
    taskKey: "steps.text.0.task",
    meta: { soundOn: true, input: "date_dm", specs: "Korrektheit/Verständlichkeit" },
    eval_questions: [],
    ui: { type: "date_dm", dayLabelKey: "ui.day", monthLabelKey: "ui.month" },
    ground: { mode: "date_dm", values: ["15.01"], day: 15, month: 1 },
    answers: { task: {} }
  },
  {
    stable_key: "text-task-master-total-cp-v1",
    step_id: 1, component: "Template",
    titleKey: "steps.text.1.title", subtitleKey: "steps.common.subtitleTask",
    showSubtitle: true, eval_type: EVAL_TYPE.TEXT, isTask: true,
    taskKey: "steps.text.1.task",
    meta: { soundOn: true, input: "text", specs: "Korrektheit/Verständlichkeit" },
    eval_questions: [],
    ui: { type: "number", suffix: "CP" },
    ground: { mode: "number", values: [120] },
    answers: { task: {} }
  },
  {
    stable_key: "text-task-ml-prereq-v1",
    step_id: 2, component: "Template",
    titleKey: "steps.text.2.title", subtitleKey: "steps.common.subtitleTask",
    showSubtitle: true, eval_type: EVAL_TYPE.TEXT, isTask: true,
    taskKey: "steps.text.2.task",
    meta: { soundOn: true, input: "text", specs: "Faktenabruf" },
    ui: {
      type: "select",
      options: [
        { id: "none",     labelKey: "steps.text.2.opt.none" },  // ✅ correct
        { id: "lin_alg",  labelKey: "steps.text.2.opt.lin_alg" },
        { id: "stats",    labelKey: "steps.text.2.opt.stats" },
        { id: "python",   labelKey: "steps.text.2.opt.python" },
        { id: "ml_basics",labelKey: "steps.text.2.opt.ml_basics" }
      ]
    },
    ground: { mode: "exact", values: ["none"] },
    answers: { task: {} },
    eval_questions: []
  },
  {
    stable_key: "text-free-interaction-v1",
    step_id: 3, component: "Template",
    titleKey: "steps.common.free.title", subtitleKey: "steps.common.subtitleTask",
    showSubtitle: true, eval_type: EVAL_TYPE.TEXT, isTask: true,
    taskKey: "steps.text.3.task", dontShowReplyField: true,
    meta: { soundOn: true, input: "text", specs: "Natürlichkeit" },
    eval_questions: [
      { id: "pleasant",      type: "likert", labelKey: "steps.common.free.pleasant",       min: 1, max: 7, answer: null },
      { id: "comprehension", type: "likert", labelKey: "steps.common.free.comprehension", min: 1, max: 7, answer: null }
    ]
  },
  {
    stable_key: "text-tlx-v1",
    step_id: 4, component: "Template",
    eval_type: EVAL_TYPE.TEXT,
    titleKey: "steps.nasa.text.title",
    showSubtitle: true,
    isTask: false,
    subtitleKey: "steps.nasa.text.subtitle",
    task: null,
    meta: { soundOn: false, input: "text", specs: "" },
    eval_questions: NASA_TLX_TEXT
  },
  {
    stable_key: "text-variant-rate-v1",
    step_id: 5, component: "Template",
    eval_type: EVAL_TYPE.AVATAR,
    titleKey: "steps.variant_rate.text.title",
    showSubtitle: true,
    isTask: false,
    subtitleKey: "steps.variant_rate.text.subtitle",
    task: null,
    meta: { soundOn: false, input: "text", specs: "" },
    eval_questions: VARIANT_RATE_TEXT
  }
];

/** Final questionnaire */
export const STATIC_CURR_FINAL: Step[] = [
  {
    stable_key: "final-questionnaire-v1",
    step_id: 0,
    component: "Template",
    eval_type: EVAL_TYPE.TEXT,
    titleKey: "steps.final.title",
    showSubtitle: true,
    isTask: false,
    subtitleKey: "steps.final.subtitle",
    task: null,
    meta: { soundOn: true, input: "text" },
    eval_questions: [
      {
        id: "pref_interface",
        type: "select",
        labelKey: "steps.final.pref_interface.label",
        options: [
          { id: "avatar", labelKey: "steps.final.pref_interface.opt.avatar" },
          { id: "text",   labelKey: "steps.final.pref_interface.opt.text"   },
          { id: "equal",  labelKey: "steps.final.pref_interface.opt.equal"  },
          { id: "none",   labelKey: "steps.final.pref_interface.opt.none"   }
        ],
        answer: null
      },
      {
        id: "comp_understanding",
        type: "likert",
        labelKey: "steps.final.comp_understanding.label",
        min: 1, max: 7,
        hintKey: "steps.final.comp_understanding.hint",
        answer: null
      },
      {
        id: "comp_comfort",
        type: "likert",
        labelKey: "steps.final.comp_comfort.label",
        min: 1, max: 7,
        hintKey: "steps.final.comp_comfort.hint",
        answer: null
      },
      {
        id: "comp_trust",
        type: "likert",
        labelKey: "steps.final.comp_trust.label",
        min: 1, max: 7,
        hintKey: "steps.final.comp_trust.hint",
        answer: null
      },
      { id: "tech_issues",     type: "text", labelKey: "steps.final.tech_issues",  answer: "" },
      { id: "final_feedback",  type: "text", labelKey: "steps.final.final_feedback",  answer: "" }
    ]

  }
];
