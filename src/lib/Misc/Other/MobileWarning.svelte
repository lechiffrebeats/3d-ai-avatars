<script lang="ts">
  import { fade, scale } from "svelte/transition";
  import headshake from "$lib/images/Misc/headshake.gif";
  import { goto } from "$app/navigation";
  import { ignoreMobileWarning } from "../about/device";
  import { isSafari } from "../../General";
  import safari from "$lib/images/Misc/safari.svg";
  import mobile from "$lib/images/Misc/mobile-slash.svg";

  let dialogEl: HTMLDivElement | null = null;
  let tryBtnEl: HTMLButtonElement | null = null;

  function focusFirst() {
    tryBtnEl?.focus();
  }

  const titleId = "mobile-warning-title";
  const descId = "mobile-warning-desc";

  function quit() {
    goto("/about?p=system");
  }

  function proceed() {
    ignoreMobileWarning();
  }
</script>

<div
  class="overlay"
  aria-modal="true"
  role="dialog"
  aria-labelledby={titleId}
  aria-describedby={descId}
  transition:fade
  bind:this={dialogEl}
  on:introend={focusFirst}
>
  <div class="modal" transition:scale={{ duration: 150 }}>
    <div class="art">
      <img
        class="avatar"
        src={headshake}
        alt="Animated warning illustration"
        width="200"
        height="200"
        decoding="async"
        loading="lazy"
        fetchpriority="low"
        draggable="false"
      />
    </div>

    <div class="body">
      <div class="titleRow">
        <h2 id={titleId}>
          ⚠️Mobile {isSafari ? "or Safari " : ""}not recommended
        </h2>
      </div>

      <p id={descId} class="lead">
        The 3D experience may not run smoothly on most phones{isSafari
          ? " and in Safari"
          : ""}. For the best results, please use a desktop/laptop and a
        <a
          href="https://www.google.com/search?q=chromium+based+browsers"
          style="color: orange;"
          target="_blank"
          rel="noopener">Chromium-based browser</a
        >.
      </p>

      <div class="controls">
        <button
          class="quit"
          on:click={quit}
          aria-label="Open system requirements"
        >
          Quit
        </button>

        <button
          class="try"
          on:click={proceed}
          bind:this={tryBtnEl}
          aria-label="Proceed on my phone"
        >
          I’m confident in my phone — try anyway 🏋️‍♀️
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .try {
    background: rgb(255, 106, 0);
    color: #fff;
    border: 1px solid #ffffff;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.45);
    padding: 12px 18px;
    min-height: 44px;
    font-weight: 600;
  }

  .quit {
    color: rgb(53, 53, 53);
    background: #ffffff;
    border: 1px solid #ffffff;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.45);
    padding: 12px 18px;
    min-height: 44px;
    font-weight: 600;
  }

  .controls {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 10px;
  }

  button {
    color: rgb(53, 53, 53);
    border: 1px solid #ffffff;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.45);
    padding: 12px 18px;
    font-size: 0.95rem;
    line-height: 1.2;
    cursor: pointer;
  }

  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(3px);
    display: grid;
    place-items: center;
    z-index: 4000;
    padding: max(16px, env(safe-area-inset-left, 0));
  }

  .modal {
    background: rgb(53, 53, 53);
    color: #fff;
    border: 1px solid #ffffff;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.45);
    display: grid;
    grid-template-columns: 260px 1fr;
    column-gap: 18px;
    row-gap: 10px;
    padding: 16px;
    max-width: min(820px, 92vw);
  }

  @media (max-width: 720px) {
    .modal {
      grid-template-columns: 1fr;
      text-align: center;
    }
    .controls {
      gap: 12px;
    }
    .art {
      justify-content: center;
    }
    .titleRow {
      justify-content: center;
    }
  }

  .art {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
  }
  .art img {
    display: block;
    max-width: 100%;
    height: auto;
  }
  .body {
    padding: 6px 6px 0 0;
  }

  .titleRow {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0 0 6px 0;
  }

  .iconWrap {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.18);
    backdrop-filter: blur(2px);
  }

  h2 {
    margin: 0;
    font-weight: 700;
    font-size: 1.45rem;
  }
  .lead {
    margin: 0 0 12px 0;
    color: #d9d9d9;
    line-height: 1.5;
  }

  @media (prefers-reduced-motion: reduce) {
    .overlay,
    .modal {
      transition: none !important;
      animation: none !important;
    }
  }
</style>
