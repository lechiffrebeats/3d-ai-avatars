import { writable } from "svelte/store";

export const isMobile = writable(false);
export const mobielWarningIgnored = writable(false);

export function updateIsMobile(width: number) {
  isMobile.set(width < 768); 
}

export function ignoreMobileWarning () {
  mobielWarningIgnored.set(true);
}