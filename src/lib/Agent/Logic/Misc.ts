import rehypeExternalLinks from "rehype-external-links";
import { get, writable } from "svelte/store";

export let bg: HTMLAudioElement | null = null;
export let ambienceOn = writable(false);
export let bgVolume = writable(15);
export let avVolume = writable(100);

export function changeVolume(v?: number) {
  if (bg) bg.volume = clamp01(get(bgVolume) / 100);
}
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

export function startBackgroundAudio() {
  if (bg) return;
  ambienceOn.set(true);
  bg = new Audio("/Audio/background.mp3");
  bg.loop = true;
  bg.preload = "auto";
  bg.volume = clamp01(get(bgVolume) / 100);
  window.addEventListener("pointerdown", () => bg?.play().catch(() => {}), { once: true });
}

export function stopBackgroundAudio() {
  if (!bg) return;
  ambienceOn.set(false);

  bg.pause();
  bg.currentTime = 0;
  bg = null;
}

export function toggleBackgroundAudio() {
  if (bg) stopBackgroundAudio();
  else startBackgroundAudio();
}

export function parseAIResponse(responseText: string): any {
  let jsonStringToParse = responseText.trim();
  const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
  const match = jsonStringToParse.match(jsonRegex);
  if (match && match[1]) {
    jsonStringToParse = match[1];
  }

  try {
    return JSON.parse(jsonStringToParse);
  } catch (error) {
    console.error("Failedo parse :", error);
    return {
      error: "Invalid JSON",
      TAKE_ACTION: false, 
      details: responseText,
    };
  }
}

export const rehypePlugins = [
    [rehypeExternalLinks, { target: "_blank", rel: ["noopener", "noreferrer"] }]
  ];