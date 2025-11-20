import { agentStore } from "$lib/Agent/Agent";
import { get } from "svelte/store";
import { chatStore } from "$lib/User/chatStore";
import { phonemes_to_blendshapes } from "../Visemes/Visemize";
import { FRAME_RATE } from "$lib/General";
/* import { phonemesToBlendshapes } from "../Visemes/Visemize"; */
function base64ToBlob(b64: string, mime = "audio/wav"): Blob {
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return new Blob([buf], { type: mime });
}
  
export async function get_tts_align(text: string) {
  const gender = get(chatStore).avatar_gender ?? "male";
  const lang = get(chatStore).userLanguage ?? "en";

  const tryFetch = async (url: string) => {
    const controller = new AbortController();
    const to = setTimeout(() => controller.abort(), 20000);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, gender, lang }),
        signal: controller.signal,
      });
      const json = await res.json().catch(() => ({} as any));
      return { res, json } as const;
    } finally { clearTimeout(to); }
  };

  let { res, json } = await tryFetch("/histarBackend/tts");
  if (!res.ok || json?.ok === false) throw new Error(json?.error || `TTS ${res.status}`);
  /* console.log("get_tts_align", json); */
  const audioBlob = base64ToBlob(json.audio_base64, json.audio_mime || "audio/wav");
  const frames = phonemes_to_blendshapes(json.phonemes, FRAME_RATE, 0.8);
  console.log("phonemesToBlendshapes: ", frames);

  agentStore.update((s) => ({ ...s, audioBlob, phonemes: json.phonemes, blendshapes: frames }));
}

export async function transcribeVoice(voiceBlob: Blob) {
  const mime =
    voiceBlob.type ||
    (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "application/octet-stream");

  const fd = new FormData();
  fd.append("audio", new File([voiceBlob], "audio.webm", { type: mime }));
  fd.append("language", (get(chatStore).userLanguage || "").toLowerCase());

  const res = await fetch("/histarBackend/stt", { method: "POST", body: fd });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.text;
}


