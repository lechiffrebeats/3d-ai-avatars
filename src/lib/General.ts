import { writable } from "svelte/store";
import { globalWarnMessage } from "./Evaluation/EvalSystem";

export const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
export const isSafari = !!ua && /^((?!chrome|android).)*safari/i.test(ua);
/* text-embedding-3-small */
export const OPENAI_MODEL_CHEAP = "text-embedding-3-small";
export const OPENAI_MODEL_MID = "gpt-3.5-turbo-0125";
export const OPENAI_MODEL_EXPENSIVE = "gpt-4.1-nano";
export const API_NAME = 'gwdg' /* 'gemini' as string; */ /* "openai"; */
export const FRAME_RATE = 60;
export const BACKGROUND_API_PYTHON = "https://api.openai.com/v1/images/generations"
export const BACKGROUND_API_GEMINI = "https://api.openai.com/v1/images/generations"

export const AVATAR_COLOR = "#ff4800ff"
export const TEXT_COLOR = "#37a1d9"
export const EQUAL_COLOR = "#94a3b8";

export const hintTimeout = writable(4_000);
export const HINT_TIMER = 50_000
export const skipTimeoutHint = writable(false);
 
export function resetHintTimer() {
  setTimeout(() => {
    globalWarnMessage.set({
      message: "",
      detail: "",
      info: {},
      show: false
    });
  }, 2000);
}

export const server_exhausted = writable(false)

/* curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent" \
  -H 'Content-Type: application/json' \
-H 'X-goog-api-key: GEMINI_API_KEY' \
-X POST \
-d '{
  "contents": [
    {
      "parts": [
        {
          "text": "Explain how AI works in a few words"
        }
      ]
    }
  ]
}' */