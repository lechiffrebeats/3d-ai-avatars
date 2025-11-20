import { writable } from "svelte/store"

export const CURR_API_SERVER = "https://histar.informatik.uni-bremen.de/" /*  "http://127.0.0.1:8000/"  */ /* "https://histar.informatik.uni-bremen.de/" */
//export const CURR_API_SERVER = "http://127.0.0.1:8000/"
export const PUBLIC_ASSET_BASE="https://histar.informatik.uni-bremen.de/assets"
export const ENABLE_RAG = writable(true)