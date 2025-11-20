<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import send from "$lib/images/Input/send.svg";
  import { browser } from "$app/environment";

  import { chatStore, messageStore, resetChat } from "../User/chatStore";
  import { inputRequest, outputRequestAgent } from "$lib/Agent/Agent";
  import {
    ALLOWED_ANIMATIONS,
    create_HISTAR_CONTENT,
    HISTAR_Types,
  } from "$lib/Agent/Logic/Static";
  import mic from "$lib/images/mic.svg";
  import { urlify } from "./Logic";
  import { _ } from "@rgglez/svelte-i18n";
  import {
    isRecording,
    mediaRecorder,
    safetyTimer,
    scrollBottomChat,
    voiceChat,
  } from "./Audio/Microphone";

  let input = "";
  let showLog = false;
  let disableSend = false;
  let listEl: HTMLDivElement | null = null;
  let inputAreaEl: HTMLDivElement | null = null;
  let ro: ResizeObserver | null = null;

  $: uiDisabled = disableSend || $chatStore.thinking;
  $: voiceBtnDisabled = (disableSend || $chatStore.thinking) && !$isRecording;

  $: if (!$chatStore.thinking && !$isRecording) {
    disableSend = false;
  }

  function scrollToBottom() {
    if (!listEl) return;
    listEl.scrollTop = listEl.scrollHeight;
  }

  function applyComposerPadding() {
    const h = inputAreaEl?.offsetHeight ?? 0;
    listEl?.style.setProperty("--composer-h", `${h}px`);
  }

  onMount(() => {
    if (!browser) return;
    /* ???????? */
    /* currEvalType.set(EVAL_TYPE.AVATAR); */

    const unsub = messageStore.subscribe(() => {
      if (showLog) queueMicrotask(scrollToBottom);
    });

    scrollBottomChat.on("scrollbottom", scrollToBottom);

    ro = new ResizeObserver(applyComposerPadding);
    if (inputAreaEl) ro.observe(inputAreaEl);
    applyComposerPadding();
    window.addEventListener("resize", applyComposerPadding);

    return () => {
      unsub?.();
      if (mediaRecorder)
        mediaRecorder.stream.getTracks().forEach((t) => t.stop());
      if (ro && inputAreaEl) ro.unobserve(inputAreaEl);
      window.removeEventListener("resize", applyComposerPadding);
    };
  });

  $: if (showLog) {
    queueMicrotask(() => {
      applyComposerPadding();
      scrollToBottom();
    });
  }

  function handleInputSend() {
    if (uiDisabled) return;
    disableSend = true;
    $chatStore.thinking = true;

    if ($chatStore.avatar_gender === "male") {
      outputRequestAgent([
        {
          output_animation: true,
          animation: "Headnodd Yes",
        },
      ]);
    }
    const trimmed = input.trim();
    if (!trimmed) {
      disableSend = false;
      $chatStore.thinking = false;
      return;
    }

    if (trimmed.toLowerCase() === "clear") {
      resetChat();
      input = "";
      disableSend = false;
      $chatStore.thinking = false;
      return;
    }

    const message = create_HISTAR_CONTENT({
      inputSource: HISTAR_Types.TEXT,
      content: trimmed,
      role: "user",
      mode: "avatar",
    });

    inputRequest(message);
    input = "";
    queueMicrotask(scrollToBottom);
  }

  let showActions = false;
  let filteredActions: string[] = [];

  function handleInputChange(e) {
    input = e.target.value;
    const re = /(action|anim|dance)/i;
    if (re.test(input)) {
      showActions = true;
      filteredActions = ALLOWED_ANIMATIONS;
    } else {
      showActions = false;
    }
  }

  function selectAction(action: string) {
    input = action;
    showActions = false;
    outputRequestAgent([
      {
        output_animation: true,
        animation: action,
      },
    ]);
  }

  let cooldown = false;
  onDestroy(() => {
    scrollBottomChat.off("scrollbottom", scrollToBottom);
    if (mediaRecorder)
      mediaRecorder.stream.getTracks().forEach((t) => t.stop());
    if (safetyTimer) clearTimeout(safetyTimer);
  });
</script>

<div class="header">
  <button
    disabled={cooldown}
    class="toggle"
    on:click={() => (showLog = !showLog)}
  >
    {showLog ? $_("input.chathide") : $_("input.chatshow")}
  </button>
  <!--  <button class="toggle" on:click={resetLocal}>{resetText}</button> -->
</div>

<div class="logWrap {showLog ? 'open' : 'closed'}" aria-expanded={showLog}>
  <div class="chat-log" bind:this={listEl} aria-live="polite">
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
  </div>
</div>

<div class="input-area" bind:this={inputAreaEl}>
  <input
    disabled={uiDisabled}
    bind:value={input}
    on:keydown={(e) => e.key === "Enter" && handleInputSend()}
    on:input={handleInputChange}
    placeholder={$_("input.placeholder")}
    aria-label="Text input"
    class="inputText"
    maxlength="500"
  />
  {#if showActions}
    <ul class="dropup">
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      {#each filteredActions as action}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <li on:click={() => selectAction(action)}>{action}</li>
      {/each}
    </ul>
  {/if}

  <button
    on:click={voiceChat}
    class="buttonDefault voiceButton"
    disabled={voiceBtnDisabled}
    class:is-recording={$isRecording}
    aria-label={$isRecording ? $_("input.stopmic") : $_("input.startmic")}
    title={$isRecording ? $_("input.stop") : $_("input.start")}
    type="button"
  >
    <img src={mic} alt="Mic" width="20" style="filter: invert(1);" />
  </button>
  <button
    disabled={uiDisabled || !input.trim()}
    on:click={handleInputSend}
    type="button"
    class="buttonDefault"
    aria-label="Senden"
    title="Senden"
  >
    <img src={send} alt="" width="20" style="filter: invert(1);" />
  </button>
</div>

<style>
  :root {
    --panel: #ffffff;
    --border: #e5e7eb;
    --text: #111827;
    --brand: #ff6200;
    --bg: transparent;
    --muted: #6b7280;
  }

  .dropup {
    position: absolute;
    bottom: 50px; 
    left: 0;
    background: white;
    color: black;
    border: 1px solid #ccc;
    border-radius: 6px;
    max-height: 200px;
    overflow-y: auto;
    list-style: none;
    padding: 5px 0;
    width: 250px;
    z-index: 9999;
  }
  .dropup li {
    padding: 6px 10px;
    cursor: pointer;
  }
  .dropup li:hover {
    background: #eee;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 0 1px 7px;
    color: #fff;
  }

  button.toggle {
    margin: 0 0 0 12px;
    padding: 0;
    background-color: transparent;
    color: #fff;
    font-size: 13px;
    border: none;
    cursor: pointer;
  }
  button.toggle:hover {
    text-decoration: underline;
  }

  .logWrap {
    overflow: hidden;
    transition: max-height 0.25s ease;
    max-height: 0;
  }
  .logWrap.open {
    max-height: 300px;
  }

  .chat-log {
    background: transparent;
    border-radius: 28px;
    overflow-y: auto;
    max-height: 300px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .row {
    display: flex;
    gap: 10px;
  }
  .row.user {
    justify-content: flex-end;
  }
  .row.system {
    justify-content: flex-start;
  }

  .bubble {
    max-width: 75ch;
    padding: 10px 12px;
    border-radius: 16px;
    line-height: 1.45;
    white-space: pre-wrap;
    word-wrap: break-word;
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
    background: #fff;
    color: var(--text);
    border-top-right-radius: 6px;
  }

  .input-area {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    padding-top: 8px;
    height: 60px;
  }

  input {
    flex: 1;
    padding: 1rem 1.5rem;
    border: 1px solid #ccc;
    border-radius: 5rem;
    font-size: 1rem;
    background-color: rgba(39, 39, 39, 0.6);
    color: white;
    margin-bottom: 0.2rem;
  }

  /*   input:placeholder-shown {
    background: transparent;
  } */

  input::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }

  .buttonDefault {
    padding: 0 1.2rem;
    height: 100%;
    border: 1px solid var(--border);
    border-radius: 4rem;
    background-color: rgba(255, 255, 255, 0.6);
    color: #0b0b0b;
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
  .buttonDefault:hover {
    background-color: rgba(255, 255, 255, 0.9);
  }
  .buttonDefault:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .buttonDefault.is-recording {
    border: 2px solid red;
    background-color: #440000;
    animation: pulse 1s infinite;
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

  @media (max-width: 768px) {
    .inputText {
      width: 100%;
    }
  }
</style>
