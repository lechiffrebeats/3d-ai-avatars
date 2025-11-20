import { writable } from "svelte/store";

export const actions = {
  adjustTone: "sad",
  clarifyContent: true,
  generateImage: true,
  changeEnviroment: true,
  elevate_observation_to_ai: false,
  react_to_observation: false,
};

/* export let morphTargetDictionary = writable({
  keyNames: 
}); */

export const ALLOWED_ANIMATIONS = [
    "Wave Hip Hop Dance",
    "Run to flip funny",
    "Salsa Dancing",
    "Kampfsport",
    "Sarcastic Headshake",

    "Talking",
    "Talking with arms",
    "Talking Arms Movement",
    "Standard Idle",
    "Idle Body Shake",
    "Idle Standing",    
    "Idle Look variant 4",
    "Idle Look 5",
    "Idle Looking Around",    
    "Idle Overly Happy",
    "Idle Heavier Breathihng",
    "Idle Kurz Runter Gucken",
    "Idle Variante 3",
    "Adjust Level Of X",
    "Hiphop Dancing",

    "Headnodd Yes",
    "Nodding Thoughtful", 
    "Lenghty Bow",
    "Informal Bow",

    "Backflip",
    "Lying Down Server Busy",
    "Swing Dancing",
    "Golf Drive",
    "Sarcastic Clapping",
] 

export const CATEGORIES_ANIMATIONS = {
    "idle": [
        "Standard Idle","Idle Standing","Idle Looking Around","Idle Kurz Runter Gucken",
        "Idle Variante 3","Idle Look variant 4","Idle Look 5","Idle Body Shake",
        "Idle Overly Happy","Idle Heavier Breathihng"
    ],
    "talk": [
        "Talking","Talking Arms Movement","Talking with arms","Sarcastic Headshake",
        "Headnodd Yes","Nodding Thoughtful"
    ],
    "dance_silly": [
        "Wave Hip Hop Dance","Hiphop Dancing","Salsa Dancing","Swing Dancing",
        "Sarcastic Clapping","Run to flip funny"
    ],
    "action_sport": [
        "Backflip","Kampfsport","Golf Drive","Adjust Level Of X"
    ],
    "rest_fail": [
        "Lying Down Server Busy"
    ],
    "formal": [
        "Lenghty Bow","Informal Bow"
    ]
}

export const RESET_ANIMATIONS = new Set ([
  "Wave Hip Hop Dance",
    "Talking",
    "Talking with arms",
    "Talking Arms Movement",
    "Run to flip funny",
    "Salsa Dancing",
    "Kampfsport",
    "Sarcastic Headshake",
    "Lenghty Bow",
    "Informal Bow",
    "Backflip",
    "Lying Down Server Busy",
    "Swing Dancing",
    "Golf Drive",
    "Sarcastic Clapping",
])
   
export const IDLE_ANIMATIONS = [
  "Standard Idle",
  "Idle Body Shake",
  "Idle Standing",    
  "Idle Look variant 4",
  "Idle Look 5",
  "Idle Looking Around",    
  "Idle Overly Happy",
  "Idle Heavier Breathihng",
  /* "Idle Kurz Runter Gucken", */
  "Idle Variante 3",
]

export const AVATAR_COLOR = "#ff4800ff"
export const TEXT_COLOR = "#00bfffff"

export const VALID_ACTION_TYPES = [
  "text",
  "speak",
  "animateBody",
  "showImage",
  "playVideo",
  "changeScene",
  "pause",
] as const;


export type ActionType = (typeof VALID_ACTION_TYPES)[number];

/* will be combined with blendshapes ARKIT */
export const staticAnimations = {
  nodYes: "nod_yes",
  smile: "smile_soft",
  encouraging: "smile_reassure",
  laugh: "laugh_gentle",
  thumbsUp: "gesture_thumbs_up",
  celebrate: "gesture_fist_pump",
  wink: "wink_playful",
  agree: "nod_enthusiastic",
  artBreak: "gesture_art_break",

  shakeNo: "shake_no",
  frown: "frown_sad",
  facepalm: "gesture_facepalm",
  sigh: "sigh_disappointed",
  disagree: "shake_head_firmly",

  neutralIdle: "idle_neutral",
  thinking: "look_up_thinking",
  confused: "tilt_head_confused",
  emphasize: "gesture_emphasize",
  question: "raise_eyebrow",
  shrug: "shrug_shoulders",
  listening: "listen_attentive",
  wave: "wave_hello",
  surprised: "gasp_surprised",
  explain: "gesture_explain",
};

/* NUR ALS SYNTAX */
export const observation_default = {
  modality: "text",
  channel: "chat",
  timestamp: Date.now(),
  confidence: 0.95,
  intensity: 0.7,
  tags: ["confusion"],
  content: {
    raw: "I still don't get this part.",
    sentiment: "negative",
    emotion: "frustrated",
    emotion_history: ["neutral", "sad", "frustrated"],
    intent: "question",
    keywords: ["get", "part"],
  },
};

export const content_default = {
  raw: "I still don't get this part.",
  sentiment: "negative",
  emotion: "frustrated",
  emotion_history: ["neutral", "sad", "frustrated"],
  intent: "question",
  keywords: ["get", "part"],
};

export const action_default = {
  summary: "The user seems confused and mildly frustrated.",
  recommendation:
    "Slow down, simplify explanations, and use a more supportive tone.",
  actions: {
    adjustTone: "empathetic",
    clarifyContent: true,
    useVisualAid: true,
    pauseExplaining: false,
    escalateToHuman: false,
  },
  animations: ["tilt_head_confused", "smile_reassure"],
  ai_user_response:
    "Hey, I noticed that might have been a bit tricky — let me explain it a different way.",
};

export function isValidAction(action) {
 if (!action || typeof action !== "object" || !VALID_ACTION_TYPES.includes(action.type)) {
      return false;
    }
}

export function areActionsValid(actions: any): boolean {
  if (!Array.isArray(actions)) {
    console.error("Input is not an array:", actions);
    return isValidAction(actions);
  }
  for (const action of actions) {
    if (!isValidAction(action)) {
      console.error("Action is missing a 'type' property:", action);
      return false;
    }
  }

  return true;
}

export interface HISTAR_CONTENT {
  /* this is for gwdl openai formatz */
  role: "user" | "system"; /* .-> bedeutet gesendet von!* */
  content: string;
  target: HISTAR_Types;
  inputSource: HISTAR_Types;
  timestamp: string;
  tone: string | null;
  audioPath: string;
  reasonCreated: string;
  backgroundPrompt?: string;
  audio: Blob | null;
  humorLevel: number;
  videoPath: string;
  data: Object;
  video: Blob | null;
  image: string;  
  modality: string;
  actions: HISTAR_Action[];
  mode: string;
}

export enum HISTAR_Types {
  NONE = "NONE",
  SPEAK = "SPEAK",
  TEXT = "TEXT",
  VIDEO = "VIDEO",
  VOICE = "VOICE",
  IMAGE = "IMAGE",
  MOVEMENT = "MOVEMENT",
  AUDIO = "AUDIO",
  VIDEO_WEBCAM = "VIDEO_WEBCAM",
  VIDEO_SCREENSHARE = "VIDEO_SCREENSHARE",
}

export const HISTAR_CONTENT_template: Omit<HISTAR_CONTENT, 'timestamp'> = {
  role: "user", /* "user" or "system" .-> bedeutet gesendet von!*/
  content: "",
  modality: "",
  target: HISTAR_Types.TEXT,
  mode: "avatar",
  inputSource: HISTAR_Types.TEXT,
  data: {},
  reasonCreated: "",
  humorLevel: 0,
  backgroundPrompt: "",
  tone: null,
  audioPath: "",
  audio: null,
  videoPath: "",
  video: null,
  image: "",
  actions: [],
};

export function create_HISTAR_CONTENT(overrides: Partial<HISTAR_CONTENT>): HISTAR_CONTENT {
  const { actions, ...restOfOverrides } = overrides;
  return {
    ...HISTAR_CONTENT_template,
    timestamp: new Date().toISOString(), 
    actions:actions ? toActionArray(actions) : [],  
    ...overrides,
  }; /* quasi einfach ..., ...overrides */
}

function toActionArray(actions: HISTAR_Action | HISTAR_Action[]): HISTAR_Action[] {
    return Array.isArray(actions) ? actions : [actions];
}

/**
 * STRUCTURE FOR SINGLE ACTION/PERFORMACE/ of agent! basically speech + animation + video maybe
 *
 */
export type HISTAR_Action =  {
  type: ActionType;
  content_markdown?: string;
  content?: string;
  tone?: string;
  lang?: string;
  mode?: string;
  animation?: string;
  breakAfter?: number;
  numberRepeat?: number;
  expression?: string;
  output_text ?: boolean;
  output_speech?: boolean;
  output_video?: boolean;
  output_image?: boolean;
  output_background?: boolean;
  backgroundPrompt?: string;
  backgroundURL?: string;
  duration?: number;
  videoURL?: "",
  imageURL?: "",
  output_animation: boolean;
  meta?: {
    reason?: string;
    confidence?: number;
    [key: string]: any;
  };
}

export const HISTAR_ACTION_template: Omit<HISTAR_Action, 'type'> = {
  tone: null,
  animation: "",
  duration: 0,
  breakAfter: 0,
  output_text: false,
  output_speech: false,
  output_image: false,
  output_video: false,
  output_animation: false,
  backgroundPrompt: "",
  output_background: false,
  backgroundURL: "",
  videoURL: "",
  imageURL: "",
  meta: {},
};

export function create_HISTAR_ACTION(overrides: Partial<HISTAR_Action>): HISTAR_Action {
  return {
    ...HISTAR_ACTION_template,
    type: overrides.type,
    ...overrides,
  };
}