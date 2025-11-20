<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import {
    initializedTrigger,
    inputRequest,
    triggerAction,
  } from "$lib/Agent/Agent";
  import { generalStore } from "$lib/Misc/generalStore";
  import mic from "$lib/images/mic.svg";
  import dotsGIF from "$lib/images/Misc/dotsGIF.gif";
  import { chatStore, messageStore } from "$lib/User/chatStore";
  import { disableSend, urlify } from "./Logic";
  import { _ } from "@rgglez/svelte-i18n";
  import { create_HISTAR_CONTENT, HISTAR_Types } from "$lib/Agent/Logic/Static";
  import {
    isRecording,
    mediaRecorder,
    safetyTimer,
    scrollBottomChat,
    startPending,
    stopPending,
    voiceChat,
  } from "./Audio/Microphone";

  let t: (k: string, o?: any) => string = (k) => k;
  $: t = $_;

  let input = "";
  let listEl: HTMLDivElement | null = null;
  let composerEl: HTMLDivElement | null = null;
  let ro: ResizeObserver | null = null;

  $: uiDisabled = $disableSend || $chatStore.thinking;
  $: voiceBtnDisabled = ($disableSend || $chatStore.thinking) && !$isRecording;
  $: inputPlaceholder = t("input.placeholder");
  $: micLabel = t($isRecording ? "input.stopmic" : "input.startmic");
  $: sendLabel = t("input.send");

  function scrollToBottom() {
    if (!listEl) return;
    listEl.scrollTop = listEl.scrollHeight;
  }

  function updateComposerPadding() {
    const h = composerEl?.offsetHeight ?? 96;
    listEl?.style.setProperty("--composer-h", `${h}px`);
  }

  let unsubscribe: () => void;

  onMount(() => {
    if (!browser) return;
    /* currEvalType.set(EVAL_TYPE.TEXT); */
    scrollBottomChat.on("scrollbottom", scrollToBottom);

    ro = new ResizeObserver(updateComposerPadding);
    if (composerEl) ro.observe(composerEl);
    updateComposerPadding();
    window.addEventListener("resize", updateComposerPadding);

    unsubscribe = messageStore.subscribe((arr) => {
      const last = arr[arr.length - 1];
      if (last && last.role === "system") {
        stopPending();
        $disableSend = false;
      }
      queueMicrotask(scrollToBottom);
    });

    initializedTrigger.emit("TEXT", {});
  });

  onDestroy(() => {
    if (!browser) return;
    unsubscribe?.();

    scrollBottomChat.off("scrollbottom", scrollToBottom);
    if (mediaRecorder)
      mediaRecorder.stream.getTracks().forEach((t) => t.stop());
    if (safetyTimer) clearTimeout(safetyTimer);
    if (ro && composerEl) ro.unobserve(composerEl);
    if (window && browser)
      window.removeEventListener("resize", updateComposerPadding);
  });

  function handleInputSend() {
    if (uiDisabled) return;

    const trimmed = input.trim();
    if (!trimmed) return;

    $disableSend = true;
    startPending();
    const message = create_HISTAR_CONTENT({
      inputSource: HISTAR_Types.TEXT,
      content: trimmed,
      role: "user",
      mode: "textonly",
    });

    inputRequest(message);
    input = "";
    $disableSend = false;
    queueMicrotask(scrollToBottom);
  }

  function autoResize(e: Event) {
    const el = e.target as HTMLTextAreaElement;
    el.style.height = "0px";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }
</script>

<div class="app">
  <div class="header">
    <h1>Text Interface</h1>
    <div class="controls">
      <p class="subtitle">(Model: meta-llama-3.1-8b-rag)</p>
    </div>
  </div>

  <div
    class="chat {$messageStore.length < 2 ? 'extendArtificial' : ''}"
    bind:this={listEl}
    aria-live="polite"
  >
    {#each $messageStore as msg}
      <div class="row {msg.role === 'user' ? 'user' : 'system'}">
        <div class="bubble">
          {#if msg.role === "system"}
            {@html urlify(msg.content_markdown ?? msg.content)}
          {:else}
            {msg.content}
          {/if}
        </div>
      </div>
    {/each}

    {#if $chatStore.thinking}
      <div class="row system">
        <div class="bubble typing">
          <img
            src={dotsGIF}
            decoding="async"
            loading="lazy"
            fetchpriority="low"
            draggable="false"
            width="26"
            height="26"
            class="typing"
            alt=""
          />
        </div>
      </div>
    {/if}
  </div>

  <div class="composer" bind:this={composerEl}>
    <div class="input-wrap">
      <!-- svelte-ignore element_invalid_self_closing_tag -->
      <textarea
        maxlength="500"
        disabled={uiDisabled}
        bind:value={input}
        rows="1"
        class="inputText"
        on:input={autoResize}
        on:click={() =>
          generalStore.update((s) => ({ ...s, ENABLE_R_RECORD_KEYS: false }))}
        on:keydown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleInputSend();
          }
        }}
        placeholder={inputPlaceholder}
        aria-label={inputPlaceholder}
      />
      <div class="actions">
        <button
          on:click={voiceChat}
          class:is-recording={$isRecording}
          disabled={voiceBtnDisabled}
          aria-label={micLabel}
          title={micLabel}
          class="voiceButton normalButton"
          type="button"
        >
          <img
            src={mic}
            alt="Mic"
            width="20"
            height="20"
            style="filter: invert(1);"
          />
        </button>
        <button
          disabled={uiDisabled || !input.trim()}
          on:click={handleInputSend}
          type="button"
          class="normalButton"
          aria-label={sendLabel}
          title={sendLabel}
        >
          {sendLabel}
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  :root {
    --bg: #f7f7f8;
    --panel: #ffffff;
    --border: #dedede;
    --text: #111827;
    --muted: #6b7280;
    --brand: #ff5500;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 0 2px 0;
    color: #232323;
  }
  h1 {
    color: #515151;
    font-size: 1.5rem;
    font-weight: bold;
    margin: 0;
    margin-left: 5px;
  }
  .subtitle {
    font-size: 10px;
    color: var(--muted);
    margin: 0;
    margin-left: 5px;
  }

  .extendArtificial {
    width: 40rem;
  }

  .app {
    height: 70vh;
    max-width: 1020px;
    margin: 0 auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .chat {
    --composer-h: 96px;
    flex: 1;
    min-height: 0;

    overflow-y: auto;
    overscroll-behavior: contain;
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 12px;
    min-width: 40rem;
    padding-bottom: calc(13px + var(--composer-h));
    display: flex;
    flex-direction: column;
  }

  .controls {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    justify-content: space-between;
    align-items: center;
  }

  .row {
    display: flex;
    gap: 10px;
    margin: 8px 0;
  }
  .row.user {
    justify-content: flex-end;
  }
  .row.system {
    justify-content: flex-start;
  }

  .bubble {
    margin: 0 10px;
    max-width: 75ch;
    padding: 9px 14px;
    border-radius: 16px;
    line-height: 1.45;
    white-space: pre-wrap;
    word-break: break-word;
    font-size: 15px;
  }
  .row.system .bubble {
    background: var(--brand);
    color: #fff;
    border: 1px solid var(--border);
    border-top-left-radius: 6px;
  }
  .row.user .bubble {
    background: #e9e9e9;
    color: #252525;
    border: 1px solid var(--border);
    border-top-right-radius: 6px;
  }

  .bubble.typing {
    display: inline-flex;
    align-items: center;
    padding: 10px 14px;
  }

  .composer {
    position: sticky;
    bottom: 0;
    background: linear-gradient(
      180deg,
      rgba(247, 247, 248, 0) 0%,
      var(--bg) 40%
    );
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-top: 6px;
    z-index: 1;
  }

  .input-wrap {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 10px;
  }
  textarea {
    flex: 1;
    resize: none;
    max-height: 80px;
    padding: 10px 12px;
    border: none;
    overflow-y: auto;
    outline: none;
    font-size: 15px;
    line-height: 1.4;
    background: transparent;
    color: var(--text);
  }
  .actions {
    display: flex;
    gap: 8px;
  }
  .normalButton {
    padding: 0 1.1rem;
    height: 40px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background-color: #111;
    color: #fff;
    font-size: 14px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition:
      transform 0.05s ease,
      background-color 0.2s ease,
      opacity 0.2s ease;
  }
  .normalButton:hover {
    background-color: #222;
  }
  .normalButton:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .voiceButton.is-recording {
    background-color: #e11d48;
    border-color: #b91c1c;
    color: #fff;
    animation: pulse 1.4s infinite;
  }
  .voiceButton.is-recording:hover {
    background-color: #e11d48;
  }
  .voiceButton.is-recording img {
    filter: none;
  }
  .voiceButton:disabled {
    opacity: 0.5;
    cursor: default;
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.5);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(255, 0, 0, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(255, 0, 0, 0);
    }
  }

  @media (max-width: 680px) {
    .app {
      max-width: none;
    }
    .header {
      gap: 6px;
    }
    h1 {
      font-size: 1.2rem;
    }
    .subtitle {
      font-size: 9px;
    }

    .extendArtificial {
      width: 100%;
    }

    .chat {
      --composer-h: 84px;
      min-width: 0;
      width: 100%;
      padding-bottom: calc(
        10px + var(--composer-h) + env(safe-area-inset-bottom, 0px)
      );
    }

    .bubble {
      max-width: 92%;
      font-size: 14px;
      padding: 8px 12px;
    }

    .composer {
      padding-top: 4px;
    }
    .input-wrap {
      gap: 6px;
      padding: 8px;
      border-radius: 14px;
    }
    textarea {
      font-size: 14px;
      line-height: 1.35;
      max-height: 90px;
    }
    .actions {
      gap: 6px;
    }
    .normalButton {
      height: 38px;
      padding: 0 0.9rem;
      font-size: 13px;
      border-radius: 10px;
    }
  }
</style>
