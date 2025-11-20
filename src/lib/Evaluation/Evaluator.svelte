<script lang="ts">
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { _ } from "$lib/i18n";

  import { generalStore } from "$lib/Misc/generalStore";
  import evaluate from "$lib/images/evaluate.svg";
  import sent from "$lib/images/sent.gif";
  import loading from "$lib/images/Misc/loading.gif";

  import OrangeBall from "./Misc/OrangeBall.svelte";
  import Progress from "./Misc/Progress.svelte";
  import Switcher from "./Main/StepSwitcher.svelte";
  import DownloadReplies from "./Misc/DownloadReplies.svelte";
  import CopySessionId from "./Misc/CopySessionId.svelte";

  import {
    evalMiscStore,
    evalPosition,
    isSubmitting,
    next,
    prev,
    session,
    submittedEval,
    submitSession,
    startEval,
    eval_session_initialized,
  } from "./EvalSystem";
  import Tester from "./Misc/Tester.svelte";

  let winEl: HTMLDivElement;
  let bodyEl: HTMLDivElement;
  let closeBtnEl: HTMLButtonElement;

  let isMobile = false;

  function updateIsMobile() {
    if (!browser) return;
    isMobile = matchMedia("(max-width: 768px)").matches;
  }

  let dragging = false;
  let pointerId: number | null = null;
  let grabDX = 0;
  let grabDY = 0;

  const clamp = (n: number, a: number, b: number) =>
    Math.max(a, Math.min(b, n));

  function isFromClose(target: EventTarget | null): boolean {
    return target instanceof Element && !!target.closest(".closeButton");
  }

  function safeDims() {
    const vw = Math.max(0, window.innerWidth || 0);
    const vh = Math.max(0, window.innerHeight || 0);
    const ww = Math.max(1, winEl?.offsetWidth ?? 420);
    const wh = Math.max(1, winEl?.offsetHeight ?? 300);
    return { vw, vh, ww, wh };
  }

  function beginDrag(e: PointerEvent) {
    if (!browser) return;
    if (isMobile) return;
    if (isFromClose(e.target)) return;

    dragging = true;
    pointerId = e.pointerId;
    (e.currentTarget as HTMLElement)?.setPointerCapture?.(pointerId);

    const { left, top } = $evalPosition;
    grabDX = e.clientX - (Number.isFinite(left) ? left : 0);
    grabDY = e.clientY - (Number.isFinite(top) ? top : 0);
    document.body.style.userSelect = "none";
  }

  function moveDrag(e: PointerEvent) {
    if (!dragging || !browser) return;
    const { vw, vh, ww, wh } = safeDims();
    const maxX = Math.max(0, vw - ww);
    const maxY = Math.max(0, vh - wh);
    const nx = clamp(e.clientX - grabDX, 0, maxX);
    const ny = clamp(e.clientY - grabDY, 0, maxY);
    evalPosition.set({ left: nx, top: ny });
  }

  function endDrag(e: PointerEvent) {
    if (!dragging) return;
    dragging = false;
    if (pointerId != null) {
      (e.currentTarget as HTMLElement)?.releasePointerCapture?.(pointerId);
      pointerId = null;
    }
    if (browser) document.body.style.userSelect = "";
  }

  let prevStep = -1;
  let unsubSession: undefined | (() => void);

  onMount(() => {
    if (!browser) return;

    updateIsMobile();

    if (!$page.url.pathname.startsWith("/evaluation")) {
      goto("/evaluation");
      return;
    }

    void startEval();

    const clampToViewport = () => {
      if (isMobile) return;
      const { vw, vh, ww, wh } = safeDims();
      const { left, top } = $evalPosition;
      const nx = clamp(Number(left) || 0, 0, Math.max(0, vw - ww));
      const ny = clamp(Number(top) || 0, 0, Math.max(0, vh - wh));
      evalPosition.set({ left: nx, top: ny });
    };
    clampToViewport();

    const onResize = () => {
      updateIsMobile();
      clampToViewport();
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    unsubSession = session.subscribe((s) => {
      if (!bodyEl) return;
      if (s?.currStep !== prevStep) {
        prevStep = s.currStep;
        bodyEl.scrollTo({ top: 0, behavior: "auto" });
      }
    });

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      unsubSession?.();
      if (browser) document.body.style.userSelect = "";
    };
  });

  $: isFirst = $session.currStep === 0;
  $: isLast = $session.currStep === ($session.steps?.length ?? 0) - 1;

  function handleClose() {
    generalStore.update((s) => ({ ...s, SHOW_EVALUATE: false }));
  }

  $: currentStep = $session?.steps?.[$session?.currStep ?? 0];
  $: stepTitle =
    (currentStep?.titleKey
      ? $_(currentStep.titleKey)
      : (currentStep?.title ?? "")) || "";

  $: panelStyle = isMobile
    ? "left:0; right:0; bottom:0; position:fixed;"
    : `left: ${$evalPosition.left}px; top: ${$evalPosition.top}px; position: fixed;`;

  $: if (!$generalStore.SHOW_EVALUATE) {
    $generalStore.SHOW_EVALUATE_HINT = false;
  }
</script>

<svelte:window on:keydown={(e) => e.key === "Escape" && handleClose()} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="Full-Window {isMobile ? 'mobile' : ''}"
  bind:this={winEl}
  style={panelStyle}
>
  <div
    class="headerBar"
    id="headerBar"
    on:pointerdown={beginDrag}
    on:pointermove={moveDrag}
    on:pointerup={endDrag}
    on:pointercancel={endDrag}
  >
    <h2 class="headingbox">
      <img
        class="logo evaluate"
        style="filter: invert(1);"
        src={evaluate}
        alt={$_("evaluator.header.iconAlt")}
        width="100"
        height="100"
        decoding="async"
        loading="lazy"
        fetchpriority="low"
        draggable="false"
      />
      {#if stepTitle}&nbsp;{stepTitle}{/if}
    </h2>

    <button
      type="button"
      class="closeButton"
      bind:this={closeBtnEl}
      on:click|stopPropagation={handleClose}
      aria-label={$_("evaluator.header.minimize")}
      title={$_("evaluator.header.minimize")}
    >
      <OrangeBall />
    </button>
  </div>

  {#if $eval_session_initialized}
    {#if $submittedEval}
      {#if $evalMiscStore.SHOW_SENDING}
        <div class="gif">
          <img
            class="icon"
            src={sent}
            alt={$_("evaluator.sending")}
            width="124"
            height="124"
            decoding="async"
            loading="lazy"
            fetchpriority="low"
            draggable="false"
          />
        </div>
      {:else if $evalMiscStore.SHOW_THANKYOU}
        <DownloadReplies />
      {/if}
    {:else}
      <div class="bodyContainer" bind:this={bodyEl}>
        {#if ($session.steps?.length ?? 0) > 1}
          <div class="stickyTop">
            <Progress />
          </div>
        {/if}

        <div class="content">
          <Switcher />
        </div>

        <div class="stickyBottom">
          <div class="controls">
            {#if !isFirst}
              <button
                class="btn ghost"
                on:click={prev}
                disabled={isFirst}
                aria-label={$_("evaluator.buttons.back")}
              >
                ◀ {$_("evaluator.buttons.back")}
              </button>
            {/if}
            {#if $page.url.hostname === "localhost"}
              <!-- <Tester /> -->
            {/if}
            {#if isFirst}
              <button class="btn primary full" on:click={() => next(true)}>
                {$_("evaluator.buttons.start")} 🤝
              </button>
            {:else if isLast}
              <CopySessionId />
              <button
                class="btn primary"
                on:click={submitSession}
                disabled={$isSubmitting}
                aria-busy={$isSubmitting}
              >
                {#if $isSubmitting}
                  <span class="spinner"></span> {$_("evaluator.sending")}
                {:else}
                  {$_("evaluator.buttons.submit")} 📨
                {/if}
              </button>
            {:else}
              <button
                class="btn primary"
                on:click={next}
                aria-label={$_("evaluator.buttons.next")}
              >
                {$_("evaluator.buttons.next")} ▶
              </button>
            {/if}
          </div>
        </div>
      </div>
    {/if}
  {:else}
    <img src={loading} class="loading-gif" alt={$_("evaluator.loading")} />
  {/if}
</div>

<style>
  .btn {
    background: var(--btn-bg, #f46200);
    color: #fff;
    border: 1px solid white;
    border-radius: 12px;
    padding: 10px 16px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition:
      transform 0.12s ease-in-out,
      opacity 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }
  .btn:hover {
    transform: scale(1.02);
  }
  .btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .btn.primary {
    --btn-bg: #f46200;
  }
  .btn.ghost {
    --btn-bg: transparent;
    color: var(--accent, #fff);
    border-color: var(--accent, #fff);
    background: #6f6f6f14;
  }
  .btn.full {
    width: 100%;
    justify-content: center;
    border-color: var(--accent, #fff);
  }

  .Full-Window {
    position: absolute;
    inset: auto;
    display: flex;
    flex-direction: column;
    max-height: min(80dvh, 620px);
    min-width: 385px;
    max-width: 430px;
    border-radius: 14px;
    z-index: 1500;
    user-select: none;
    overflow: hidden;
    cursor: default;
    border: 1.5px solid rgb(255, 255, 255);
    background: rgba(64, 64, 64, 0.7);
    backdrop-filter: blur(15px);
    box-sizing: border-box;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.85);
  }

  .Full-Window.mobile {
    left: 0 !important;
    right: 0 !important;
    bottom: 10px !important;
    top: auto !important;
    min-width: 100vw;
    max-width: 100vw;
    max-height: calc(100svh - env(safe-area-inset-top, 0px));
    height: clamp(70svh, 87svh, 95svh);
    border-radius: 14px 14px 0 0;
  }

  .headerBar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: rgb(244, 98, 0);
    color: white;
    border-radius: 14px 14px 0 0;
    padding: 6px 8px;
    touch-action: none;
  }

  .Full-Window.mobile .headerBar {
    padding-top: calc(6px + env(safe-area-inset-top, 0px));
  }

  .closeButton {
    margin-right: 7px;
    cursor: pointer;
    background: transparent;
    border: none;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
  }

  .bodyContainer {
    flex: 1 1 auto;
    overflow-y: scroll;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    user-select: text;
    scrollbar-color: #ff4800;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
  }

  .stickyTop {
    position: sticky;
    top: 0;
    z-index: 1500;
    padding: 10px 10px 6px;
    background: rgba(64, 64, 64, 0.85);
    backdrop-filter: blur(5px);
  }

  .content {
    padding: 1rem;
    display: block;
  }

  .stickyBottom {
    padding: 8px 10px;
    position: sticky;
    bottom: 0;
    z-index: 2;
    background: rgba(64, 64, 64, 1);
    backdrop-filter: blur(5px);
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    width: 100%;
  }

  .headingbox {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
  }
  h2 {
    margin: 0;
    padding: 4px 8px;
    font-weight: 600;
    color: #fff;
  }
  .logo {
    height: 32px;
    width: auto;
  }

  .gif {
    display: grid;

    place-items: center;
    padding: 1rem;
  }

  @media (max-width: 768px) {
    .btn {
      font-size: 17px;
      padding: 12px 16px;
    }
  }
</style>
