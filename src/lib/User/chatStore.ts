import { writable, get } from "svelte/store";
import mitt from "mitt";
import { session } from "$lib/Evaluation/EvalSystem";
import { server_exhausted } from "$lib/General";
import { backgrounds } from "$lib/Agent/Avatar";
export const chatInited = writable(false);

export const service_message = () => {
  return {
    "role": "system", 
    "content": "Servers seem to be down💤, please come back later!", 
    "timestamp": new Date().toISOString(), 
    "animation": "Lying Down Server Busy",
  };

}

/* let current_chat_api = "LLAMA";
let api_local_llm =  'http://localhost:5000/chat/generate-response';
let api_online_llm = `http://localhost:5173/backend/llm/online-llm`; */
/* const API_URL = 'http://localhost:5000/tts/generate-audio-and-animation' */

/* track user - openai state */
export const chatStore = writable({
  thinking: false,
  messages: [  ],
  type: "default",
  backgroundPrompt: "",
  avatar_gender: "male",
  backgroundImage: null,
  userLanguage : "de",
  use_full: true, /* RAG MODEL SLOWER */
});

export const backgroundChangeEvent = mitt();
export const messageStore = writable([/* role: "system", content: "You are a helpful system.", "step_id": null" */]);

export function addMessageClient(request) {
  const curr_step_id = get(session).currStep;

  const newMessage = {
    "role": request.role, 
    "content": request.content, 
    "contet_markdown": request.content_markdown,
    "step_id": curr_step_id, 
    "lang": request.lang || get(chatStore).userLanguage,
    "gender": get(chatStore).avatar_gender,
    "timestamp": new Date().toISOString(), 
    "animation": request.role === "user" ? null : request.animation,
    "expression": request.role === "user" ? null : request.expression
  };
  
  messageStore.update((s) => [...s, newMessage]);
}


export async function generateAwnser(text, lang = 'Deutsch') {
  const convo = get(messageStore).map(m => ({
    role: m.role === 'system' ? 'system' : 'user',
    content: m.content,
  })) ;

  const res = await fetch('/histarBackend/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      IS_INIT_PROMPT: false,
      lang: get(chatStore).userLanguage || lang,
      prompt: text,
      conversation: convo,
      use_full: get(chatStore).use_full
    }),
  });

  if(res.status > 400) {
    server_exhausted.set(true);
    const t = await res.text();
    throw new Error(`Chat failed (${res.status}): ${t}`);
  }
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Chat failed (${res.status}): ${t}`);
  }

  server_exhausted.set(false);
  const fullResponse = await res.json();
  const fullReply = fullResponse.choices[0].message.content.trim();
  const fullReplyJson = JSON.parse(fullReply);
  
  return fullReplyJson
}

export function resetChat() {
  const currImage = get(chatStore).backgroundImage || backgrounds.day[0];

  chatStore.set({
    messages: [],
    type: "default",
    backgroundImage: currImage,
    use_full: true,
    backgroundPrompt: "",
    userLanguage: "de",
    avatar_gender: "male",
    thinking: false
  });
}

