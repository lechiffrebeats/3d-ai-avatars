
  /* SOURCE: https://stackoverflow.com/questions/1500260/detect-urls-in-text-with-javascript */
import DOMPurify from "dompurify";
import { marked } from "marked";
import { writable } from "svelte/store";

export let disableSend = writable(false);

export function urlify(text) {
  if (!text) return "";
  const urlRegex = /\b((https?:\/\/|www\.)[^\s]+)/gi;
  return text.replace(urlRegex, (url) => {
    let href = url;
    if (!href.match(/^https?:\/\//i)) {
      href = "http://" + href;
    }
    const safe = encodeURI(href);
    return `<a target="_blank" rel="noopener noreferrer" href="${safe}">${url}</a>`;
  });
}

export async function renderMarkdown(md) {
    const marked_input = await marked(md || "")
  return  DOMPurify.sanitize(marked_input, { USE_PROFILES: { html: true } });
}
