  import { DEMO_QUESTIONS, EVAL_QUESTIONS, GAAIS_QUESTIONS, NASA_TLX_AVATAR, NASA_TLX_TEXT, STATIC_CURR_FINAL } from "$lib/Evaluation/Evaluation";
import discord from "$lib/images/platforms/discord-icon.svg";
  import email from "$lib/images/platforms/email-1.svg";
  import google from "$lib/images/platforms/google.png";
  import instagram from "$lib/images/platforms/instagram-1.svg";
  import none from "$lib/images/platforms/none.svg";
  import reddit from "$lib/images/platforms/reddit.svg";
  import web from "$lib/images/platforms/web.svg";
  import whatsapp from "$lib/images/platforms/whatsapp.svg";
import { writable } from "svelte/store";
import { mean, median, sd } from "./HelpersMath";

  export const statsCalculated = writable(false);

  export const filterStableKeys_tasks = ["text-free-interaction-v1", "avatar-free-interaction-v1"]

  export const PLATFORM_ICONS = {
    discord: { name: "Discord", src: discord, cnt:0 },
    /* email: { name: "Email", src: email, cnt:0 }, */
    /* google: { name: "Google", src: google, cnt:0 }, */
    instagram: { name: "Instagram", src: instagram, cnt:0 },
    none: { name: "None", src: email, cnt:0 },
    reddit: { name: "Reddit", src: reddit, cnt:0 },
    web: { name: "Website", src: web, cnt:0 },
    whatsapp: { name: "WhatsApp", src: whatsapp, cnt:0 }
};

export const stable_key_to_string = {
  
}

export const objectToArray = (obj) => Object.keys(obj).map((key) => [key, obj[key]]);
export const toPlatformSymbolData = (bump = 0, size = 28) => {
  /* const addCntPLATFORM_ICONS = PLATFORM_ICONS.map(p => ({ ...p, cnt: 0 })); */
  const res = Object.values(PLATFORM_ICONS).map(p => ({
    coord: [p.name, (p.cnt ?? 0) + bump],
    symbol: `image://${p.src}`,
    symbolSize: size
  }));
  return res
}

export const platformCategories = Object.values(PLATFORM_ICONS).map(p => p.name);
export const STABLE_TYPES = ["GAAIS_QUESTIONS", "EVAL_QUESTIONS", "NASA_TLX", "FINAL_QUESTIONS","DEMO_QUESTIONS"]

export const findOriginalQuestion = (id: string, stable_type: string) => {
  switch (stable_type) {
    case "GAAIS_QUESTIONS":
      return GAAIS_QUESTIONS.find((q) => q.id === id)
    case "EVAL_QUESTIONS":
      return EVAL_QUESTIONS.find((q) => q.id === id)
    case "FINAL_QUESTIONS":
      return STATIC_CURR_FINAL[0]?.eval_questions.find((q) => q.id === id)
    case "DEMO_QUESTIONS":
      return Object.values(DEMO_QUESTIONS).find((q, _) => q === id)
    case "NASA_TLX":
      const helper = id.split("_").pop()
      return NASA_TLX_TEXT.find((q) => (q.id).split("_").pop() === helper)
    default:
      return null
  }
}



export const hex8toRGBA = (hex: string, a = 1) => {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(
      hex
    );
    if (!m) return `rgba(0,0,0,${a})`;
    const r = parseInt(m[1], 16),
      g = parseInt(m[2], 16),
      b = parseInt(m[3], 16);
    return `rgba(${r},${b ? g : g},${b},${a})`;
  };
export const hex8toHex = (hex: string) => `#${hex.replace("#", "").slice(0, 6)}`;