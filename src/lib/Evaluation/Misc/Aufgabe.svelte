<script lang="ts">
  import { _ } from "@rgglez/svelte-i18n";
  import copySVG from "$lib/images/copy.svg";

  export let topText: string | undefined;
  export let dontShowReplyField = false;
  export let FullCurrStep: any;

  let copied = false;

  $: subtitleText = topText
    ? $_(topText)
    : FullCurrStep?.subtitleKey
      ? $_(FullCurrStep.subtitleKey)
      : (FullCurrStep?.subtitle ?? "");

  $: taskText = FullCurrStep?.taskKey
    ? $_(FullCurrStep.taskKey)
    : (FullCurrStep?.task ?? "");

  async function copy() {
    const text = taskText ?? "";
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      copied = true;
    }
    setTimeout(() => (copied = false), 1300);
  }
</script>

<div class="aufgabe-card">
  <header class="header">
    <p class="subtitle">{subtitleText}</p>
  </header>

  {#if taskText}
    <div class="task">
      <p class="text">{taskText}</p>

      <!--  {#if !dontShowReplyField}
        <button
          class="copy"
          type="button"
          on:click={copy}
          aria-label={$_("common.copy")}
          title={copied ? $_("common.copied") : $_("common.copy")}
        >
          {#if copied}
            ✓
          {:else}
            <img src={copySVG} width="100%" style="filter: invert(1);" alt="" />
          {/if}
        </button>
      {/if} -->
    </div>
  {/if}
</div>

<style>
  .aufgabe-card {
    width: 100%;
    border-radius: 12px;
    background: #3a3a3a;
    color: white;
    background: #333333;
    color: white;
    border: white 1px solid;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .header {
    background: #4e4e4e;
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  }

  .subtitle {
    margin: 0;
    font-weight: 600;
    font-size: 0.95rem;
  }

  .task {
    position: relative;
    padding: 0.75rem 2.25rem 0.75rem 0.75rem;
    font-size: 0.95rem;
    line-height: 1.3;
  }

  .text {
    margin: 0;
    user-select: text;
  }

  /* fixxxxxxxxxxxxx */
  .copy {
    position: absolute;
    right: 0.5rem;
    bottom: 0.5rem;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 8px;
    background: #525252;
    color: #fff;
    display: grid;
    place-items: center;
    cursor: pointer;
    transition:
      opacity 0.15s ease,
      transform 0.05s ease;
  }
  .copy:hover {
    opacity: 0.9;
  }
  .copy:active {
    transform: scale(0.98);
  }
</style>
