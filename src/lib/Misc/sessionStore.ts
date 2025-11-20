import { get } from "svelte/store";
import { chatInited, chatStore, messageStore } from "../User/chatStore";
import { reset_eval_session, session } from "$lib/Evaluation/EvalSystem";
import { browser } from "$app/environment";
import { backgrounds } from "$lib/Agent/Avatar";

export function get_unique_id() {
  return (crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`).toString();
}

export function set_avatar_gender(gender: "male" | "female"): void {
  chatStore.update((s) => ({ ...s, avatar_gender: gender }));
  const url=new URL(window.location.href); 
  url.searchParams.set("gender", String(gender)); 
  window.history.replaceState({}, "", url);
  session.update((s) => ({ ...s, meta: { ...s.meta, avatar_gender: gender } }));
  
  localStorage.setItem("AVATAR_GENDER", gender);
}

export function get_avatar_gender(): "male" | "female" {
  if (!browser) return "male";

  const norm = (v: unknown): "male" | "female" | null => {
    if (!v) return null;
    const s = String(v).toLowerCase();
    if (s === "male" || s === "m") return "male";
    if (s === "female" || s === "f") return "female";
    return null;
  };

  const fromUrl = norm(new URL(window.location.href).searchParams.get("gender"));
  const fromStorage = norm(localStorage.getItem("AVATAR_GENDER"));
  const fromStore = norm(get(chatStore).avatar_gender);

  const finalGender = fromUrl ?? fromStore ?? fromStorage ?? "male";
  chatStore.update((s) => ({ ...s, avatar_gender: finalGender }));
  try { localStorage.setItem("AVATAR_GENDER", finalGender); } catch {}

  return finalGender;
}

export const languages = [
    { code: "en", flag: "/flags/usa.svg", label: "English", available: true },
    {
      code: "de",
      flag: "/flags/german.svg",
      label: "Deutsch",
      available: true,
    },
    {
      code: "fr",
      flag: "/flags/french.svg",
      label: "Français",
      available: false,
    },
  ];

let isResetting = false;

export async function resetSession() {
  if (isResetting) return;
  isResetting = true;

  chatStore.set({
    avatar_gender: "male",
    thinking: false,
    messages: [],
    type: "default",
    use_full: true,
    backgroundPrompt: "",
    backgroundImage: backgrounds.day[0],
    userLanguage: "de",
  });

  /* alles reseeeten */
  reset_eval_session();
  chatInited.set(true);
  messageStore.set([]);
  localStorage.removeItem("AVATAR_GENDER");

  /* alles wieder rein */
  await initialize_user_session();

  isResetting = false;
}

export async function initialize_user_session(userLanguage = "Deutsch") {
  await fetch("/histarBackend/session", { method: "GET", credentials: "include" });

  /* const res = await fetch("/histarBackend/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      IS_INIT_PROMPT: true,
      userLanguage,
      prompt: "INIT",
      conversation: [],
    }),
  });
 */
  /* if (res.status !== 204) {
    throw new Error(`Init failed (${res.status}): ${await res.text()}`);
  } */
}
