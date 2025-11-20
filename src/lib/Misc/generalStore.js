import { writable } from "svelte/store";

export const API_COOLDOWN_DURATION = 4000; // ms
export const OBSERVATION_COOLDOWN_DURATION = 10000;

export const generalStore = writable({
  ENABLE_R_RECORD_KEYS: true,
  CHANGE_BACKGROUND: true,
  CHANGE_TUTOR: false,
  LITE_MODE: false,
  DETECT_EMOTION: false,
  ENABLE_CAMERA: false,
  ENABLE_MICROPHONE: false,
  ENABLE_SPEECH_RECOGNITION: false,
  ENABLE_SPEECH_SYNTHESIS: false,
  ENABLE_VIDEO: false,
  SHOW_EVALUATE: false,
  EVAL_MODE: false,
  ASSETS_LOADED: false,
  ENABLE_BACKGROUND_AUDIO: false,
  utm_source: "",
  SHOW_EVALUATE_HINT: false,
});

/* true = cooldowned = kann losgehen */
export const coolDownStore = writable({
  /* GENETRAL */
  INPUT: true,
  OUTPUT: true,
  INPUT_OBSERVATION: true,

  /* MISC */
  CHANGE_BACKGROUND: true,
  CHANGE_TUTOR: true,
  DETECT_EMOTION: true,
  OBSERVATION: true,
  ENABLE_CAMERA: true,
  ENABLE_MICROPHONE: true,
  ENABLE_SPEECH_RECOGNITION: true,
  ENABLE_SPEECH_SYNTHESIS: true,
  ENABLE_VIDEO: true,
});

export function resetCooldownProperty(property) {
  if (!property) return;
  setTimeout(() => {
    coolDownStore.update((s) => ({ ...s, [property]: true }));
  }, OBSERVATION_COOLDOWN_DURATION);
}
