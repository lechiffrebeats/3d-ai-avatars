<script lang="ts">
  import { browser } from "$app/environment";
  import { session } from "../EvalSystem";

  let copied = false;
  let copyTimer: ReturnType<typeof setTimeout> | null = null;

  async function copyId(id: string) {
    if (!browser || !id) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(id);
      } else {
        const ta = document.createElement("textarea");
        ta.value = id;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      copied = true;
      if (copyTimer) clearTimeout(copyTimer);
      copyTimer = setTimeout(() => (copied = false), 1500);
    } catch (e) {
      console.error("Copy failed:", e);
    }
  }
</script>

<!-- <span
  class="copyable-id"
  role="button"
  tabindex="0"
  title={copied ? "Kopiert!" : "Klicken zum Kopieren"}
  on:click={() => copyId($session.session_id)}
  on:keydown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      copyId($session.session_id);
    }
  }}
>
  {$session.session_id}
  {#if copied}<span class="copied">✓ kopiert</span>{/if}
</span> -->

<style>
  .copyable-id {
    color: rgb(64, 228, 5);
    cursor: pointer;
    user-select: text;
    padding: 0 0.25rem;
    border: 1px dashed rgba(221, 0, 0, 0.35);
    border-radius: 6px;
  }
  .copyable-id:hover {
    border-color: #ffffff;
  }
  .copyable-id:focus {
    outline: 2px solid #f46200;
    outline-offset: 2px;
  }
  .copied {
    margin-left: 0.35rem;
    color: #10a37f;
    font-weight: 600;
  }
</style>
