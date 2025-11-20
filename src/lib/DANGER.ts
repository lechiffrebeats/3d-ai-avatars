import { writable } from "svelte/store"

export const IS_TEST_VERSION = writable(false)
export const GLOBALS = writable({
    chartheight: 270,
})
/* https://www.surveycircle.com/de/surveys/ */

export const logggggg = (message) => {
  const time = new Date().toLocaleTimeString();
  console.log(
    `%c${message}%c  @ ${time}`,
    `color:${ "#ffffffff"}`,
    `color:#999`
  );
};