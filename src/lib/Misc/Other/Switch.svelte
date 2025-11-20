<script lang="ts">
  import { chatStore } from "$lib/User/chatStore";
  import { ENABLE_RAG } from "../../../routes/histarBackend/Misc";
</script>

<label class="wrap">
  <span class="lbl">RAG {$ENABLE_RAG ? "ON" : "OFF"}</span>
  <input
    class="native"
    type="checkbox"
    checked={$ENABLE_RAG}
    on:change|preventDefault|stopPropagation={(e) => {
      ENABLE_RAG.set((e.target as HTMLInputElement).checked);
      chatStore.update((s) => ({ ...s, use_full: $ENABLE_RAG }));
    }}
  />
  <span class="switch" aria-hidden="true"><span class="knob" /></span>
</label>
<br />
<small style="font-size: smaller; font-weight: 500;">
  {$ENABLE_RAG
    ? "Accessing curated knowledge — slower, but more accurate."
    : "Faster replies without knowledge base."}
</small>

<style>
  .wrap {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    user-select: none;
  }

  .lbl {
    font-size: 0.95rem;
  }

  .native {
    position: absolute;
    opacity: 0;
    pointer-events: none;
    width: 0;
    height: 0;
  }

  .switch {
    --w: 38px;
    --h: 22px;
    --pad: 3px;
    width: var(--w);
    height: var(--h);
    background: #cbd5e1;
    border-radius: 999px;
    position: relative;
    transition: background 0.18s ease;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
  }
  .knob {
    position: absolute;
    top: var(--pad);
    left: var(--pad);
    width: calc(var(--h) - 2 * var(--pad));
    height: calc(var(--h) - 2 * var(--pad));
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
    transition: transform 0.18s ease;
  }

  .native:checked + .switch {
    background: #10b981;
  }
  .native:checked + .switch .knob {
    transform: translateX(calc(var(--w) - var(--h)));
  }

  .native:focus-visible + .switch {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
</style>
