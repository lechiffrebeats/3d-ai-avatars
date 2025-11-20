import { browser } from "$app/environment";
import { get, writable } from "svelte/store";
import { disableSend } from "../Logic";
import { chatStore } from "$lib/User/chatStore";
import mitt from "mitt";
import { create_HISTAR_CONTENT, HISTAR_Types } from "$lib/Agent/Logic/Static";
import { inputRequest } from "$lib/Agent/Agent";
import { currEvalType } from "$lib/Evaluation/EvalSystem";
import { EVAL_TYPE } from "$lib/Evaluation/Evaluation";

export const scrollBottomChat = mitt();

export let micStream: MediaStream | null = null;
export  let mediaRecorder: MediaRecorder | null = null;
export let isRecording = writable(false);
export  let audioContext: AudioContext | null = null;
export let voiceBtnDisabled = writable(false);

export function pickMime(): string | undefined {
const prefs = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/ogg",
];
for (const t of prefs)
    if ((window as any).MediaRecorder?.isTypeSupported?.(t)) return t;
return undefined;
}

async function stopRecording() {
    if (!mediaRecorder) return;
    if (mediaRecorder.state !== "inactive") mediaRecorder.stop();
    await new Promise((r) => setTimeout(r, 0));

    if (micStream) {
      micStream.getTracks().forEach((t) => t.stop());
      micStream = null;
    }
    mediaRecorder = null;
  }
  export async function voiceChat() {
    if (!browser) return;

    if (get(isRecording)) {
      await stopRecording();
      isRecording.set(false);
      disableSend.set(false);
      return;
    }
    if (get(voiceBtnDisabled)) return;

    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      isRecording.set(true);
      disableSend.set(true);

      const mimeType = pickMime();
      mediaRecorder = new MediaRecorder(
        micStream,
        mimeType ? { mimeType } : {}
      );
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        try {
          isRecording.set(false);

          const blob = new Blob(chunks, { type: mimeType || "audio/webm" });
          if (blob.size === 0) {
            console.warn("Empty audio blob.");
            disableSend.set(false)
            return;
          }
          if (blob.size > 10 * 1024 * 1024) {
            alert("Audio file is too large. Please try again.");
            disableSend.set(false)
            return;
          }

          startPending();

          const audioRequest = create_HISTAR_CONTENT({
            inputSource: HISTAR_Types.AUDIO,
            audio: blob,
            role: "user",
            mode: get(currEvalType) === EVAL_TYPE.TEXT ? "textonly" : "",
          });

          inputRequest(audioRequest);
        } catch (e) {
          console.error("Audio send failed:", e);
          stopPending();
          disableSend.set(false)
        } finally {
          disableSend.set(false)
          queueMicrotask(scrollToBottom);
        }
      };

      mediaRecorder.start(250);
    } catch (err) {
      console.error("Microphone error:", err);
      await stopRecording();
      isRecording.set(false);
      disableSend.set(false)
      stopPending();
    }
  }

export let safetyTimer: ReturnType<typeof setTimeout> | null = null;

  export   function startPending() {
    chatStore.update((s) => ({ ...s, thinking: true }));
    if (safetyTimer) clearTimeout(safetyTimer);
    safetyTimer = setTimeout(() => (chatStore.update((s) => ({ ...s, thinking: false }))), 30000);
  }

  export function stopPending() {
    if (safetyTimer) clearTimeout(safetyTimer);
    safetyTimer = null;
    chatStore.update((s) => ({ ...s, thinking: false }));
  }
function scrollToBottom(): void {
    scrollBottomChat.emit("scrollbottom", {});
}

