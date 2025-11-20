import { writable, get, type Writable } from "svelte/store";
import {
  addMessageClient,
  chatStore,
  generateAwnser,
  service_message,
} from "$lib/User/chatStore";

import mitt from "mitt";
import { coolDownStore, resetCooldownProperty } from "$lib/Misc/generalStore";
import {  create_HISTAR_CONTENT, HISTAR_Types,   isValidAction,   type HISTAR_Action,  type HISTAR_CONTENT } from "./Logic/Static";
import { parseAIResponse } from "./Logic/Misc";
import { get_tts_align, transcribeVoice } from "$lib/Modalities/Audio/Audio";
import { server_exhausted } from "$lib/General";

export const triggerAction = mitt();
export const actionQueue = writable([]);
export const reportObservation = mitt(); 
export const observationQueue = writable([]);

export const initializedTrigger = mitt();

const INPUT_COOLDOWN = 5000;
const OUTPUT_COOLDOWN = 2000;

type Phoneme = { start: number; duration: number; phoneme: string };

export interface AgentStyle {
  humorLevel: number; 
}

export interface agentStoreState {
  advFrames: any[];
  advTimes: number[];
  adv: { times: number[]; frames: any[]; };
  actions: HISTAR_Action[];
  triggerActions: boolean;
  isActing: boolean;
  audioBlob: Blob | null;
  stats: {
    durationSeconds?: number;
    realTimeFactor?: number;
    numPhonemes?: number;
    numBlendshapeFrames?: number;
    calcTime?: string;
    [key: string]: any;
  } | null;
  phonemes: Phoneme[] | null;
  blendshapes:[];
  agentStyle: AgentStyle;
}

export const agentStore: Writable<agentStoreState> = writable({
    actions: [],
    triggerActions: false,
    isActing: false,
    audioBlob: null,
    stats: null,
    phonemes: null,
    blendshapes: null,
    /* blendshae stuff */
    adv: null,
    advTimes: null,
    advFrames: null,
    /* nusc */
    agentStyle: {
      humorLevel: 0.5,
    },
});

export function mainAgent(request) {}

async function thinkAndReply(text: string, request, service = "GWDL" /* LLAMA */) {
  try {
    const fullReply = await generateAwnser(text);
    console.log("content fullReply", fullReply);
    
    if( !fullReply.reply ) {
      chatStore.update((s) => ({ ...s, thinking: false }));
      server_exhausted.set(true);
      addMessageClient(service_message);
      return
    }
    
    const newAction: HISTAR_Action = {
        content: fullReply.reply,
        content_markdown: fullReply.content_markdown || null,
        output_speech: request.mode ==="textonly" ? false : true,
        output_animation: request.mode ==="textonly" ?  false : true,      
        output_background: false,
        output_text: true,
        numberRepeat: 1,
        animation: fullReply.animation,
        expression: fullReply.expression,
        backgroundPrompt: null,
        type: request.mode ==="textonly" ? "text" : "speak",
        mode: request.mode,
        lang: request.lang
    };

    await outputRequestAgent([newAction]);

  } catch (error) {
    addMessageClient(service_message);
    chatStore.update((s) => ({ ...s, thinking: false }));
    console.error("Error in thinkAndReply:", error);
  }
}

export async function inputRequest(request: HISTAR_CONTENT) {

    chatStore.update((s) => ({ ...s, thinking: true }));
    coolDownStore.update((s) => ({ ...s, INPUT: false }));
    let finalInputTextForm = ""

    switch (request.inputSource) {
        case HISTAR_Types.TEXT:
            addMessageClient({ role: "user", ...request });
            finalInputTextForm = request.content
            break;

        case HISTAR_Types.AUDIO:
            const transcription = await transcribeVoice(request.audio);
            console.log("transcription", transcription);
            
            addMessageClient({ role: "user", content: transcription });
            finalInputTextForm = transcription
            break;

        case HISTAR_Types.VIDEO_WEBCAM:
            const observationResponse = await observationHandler(request);
            finalInputTextForm = observationResponse
            break;

        case HISTAR_Types.IMAGE:
        case HISTAR_Types.VIDEO_SCREENSHARE:
        default:
            break;
    }

    /* MAIN ANTWORT */
    await thinkAndReply(finalInputTextForm, request, "LLAMA");

    setTimeout(() => {
        coolDownStore.update((s) => ({ ...s, INPUT: true }));
        chatStore.update((s) => ({ ...s, thinking: false }));
    }, 5000);
}

/*
  TRIGGER SYSTEM
  always from agent never from user#
  immer create_HISTAR_CONTENT benitzen 
  AUF GAR KEINEN FALL NOCH MAL IRGENDWO INPUTREQUEST HEIR!!!!
*/
export async function outputRequestAgent(histar_actions) {
  coolDownStore.update((s) => ({ ...s, OUTPUT: false }));

    const bearbeiteSingleAction = async (action: HISTAR_Action) => {
      
      if ( action.output_text ) {
         addMessageClient({role: "system", content: action.content, content_markdown: action.content_markdown, animation: action.animation, expression: action.expression}); 
          if(action.mode === "textonly") {
            chatStore.update((s) => ({
              ...s,
              thinking: false
            }));
          }
      }
      if( action.output_speech ) {
        await get_tts_align(action.content);
      }
      if ( action.output_video ) {
      }
      if ( action.output_image ) {
      }
      if (false && action.output_background) {
        
      }
      if(action.output_animation) {
        triggerAction.emit("PLAY_ACTION", action);
      }
    }

    for (const action of histar_actions) {
      bearbeiteSingleAction(action);
    }

    setTimeout(() => {
      coolDownStore.update((s) => ({ ...s, OUTPUT: true }));
    }, 3000);
}


/* das ding funktioniert nicht wirklich ometnan */
const observationHandler = async (observation) => {
  observationQueue.update((queue) => [...queue, observation]);

  if (!get(coolDownStore).OBSERVATION) {
    console.warn("Observation on cooldown");
    return;
  }
  coolDownStore.update((s) => ({ ...s, OBSERVATION: false }));
  let currObservation;

  observationQueue.update((queue) => {
    currObservation = queue.shift();
    return queue;
  });

  console.log("Observation Request Client:", currObservation);

  const res = await fetch(`/backend/llm/observation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ observation: currObservation }), 
  });
  const { reply } = await res.json();
  const parsed = parseAIResponse(reply);

  console.log("Observation Response Client:", parsed);
  
  if (reply.TAKE_ACTION && !isValidAction(reply.actions)) {
    console.error("Invalid action response von AI API", reply);
    return;
  }

  const observationResponse = reply;
  /* Wichrig */
  resetCooldownProperty("OBSERVATION"); /* cool down */

  return observationResponse;
};

/* Behaviour tracking
  - tracks user behaviour to estimate users cognitive state, emotional state
  alles aufbrechen in subfunktionen
*/
export const behaviourStore = writable({
  /* body arrs */
  face_movements: [],
  body_movements: [],
  eye_movements: [],
  head_movements: [],
  blink_rate: 0,
  gaze_focus: true,

  /* speech, vioce, mic */
  voice_tone: { valence: "neutral", arousal: "low" },
  speech_rate: 120,
  silence_duration: 0,

  /* text */
  text_sentiment: 0.1,
  text_emotion: { frustration: 0.3, joy: 0.1 },
  typing_speed: 40,
  typing_pauses: [],

  interaction_frequency: 3,
  time_inactivity: 15000,
  focus_changes: 0,

  /* general stuff */
  user_state_current: { emotion: "neutral", intensity: 0.2, time: Date.now() },
  user_state_last: { emotion: "neutral", intensity: 0.1, time: Date.now() },
  user_state_trend: "rising",
  user_state_timeInState: 4200,

  user_cognitive_state: "fatigue",
  user_attention_state: "focused",
  user_engagement_score: 72,
});

export function generate_observation(observationRequest ): HISTAR_CONTENT {

  const {
    emotion,
    intensity,
    channel,
    content,
    confidence,
    tags = [],
    intent = "",
    sentiment = "",
    message = "",
  } = observationRequest;

  let chatHistory = get(chatStore).messages;
  chatHistory = chatHistory.slice(-10);

  /* curr observat */
  const observation = create_HISTAR_CONTENT({
      inputSource: HISTAR_Types.VIDEO_WEBCAM,
      reasonCreated: "Emotion Change detected",
      data: {
        detectedEmotion: emotion || "neutral",
        intensity: intensity || 0,
        sentiment,
        intent,
        confidence: confidence || 0,
        tags,
        message: message || content || "",
        channel,
        chatHistory
      },
      modality: "video",
    });

  return observation
}

export const loadUserData = () => {};
