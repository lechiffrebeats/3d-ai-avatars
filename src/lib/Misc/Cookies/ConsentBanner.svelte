<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { fade, scale } from "svelte/transition";
  import {
    acceptAllCookies,
    acceptEssentialOnly,
    hasConsent,
    hasTOS,
    hasAnalytics,
  } from "$lib/Misc/Cookies/consent";
  import { invalidateAll } from "$app/navigation";
  import { _ } from "$lib/i18n";

  let open = false;
  let accepted = false;
  let agreeTOS = false;
  let allowAnalytics = false;
  let utmSource: string | null = null;

  function shouldShowHere(pathname: string) {
    return !pathname.startsWith("/about");
  }
  function computeInitialOpen(pathname: string) {
    return shouldShowHere(pathname) && (!hasConsent() || !hasTOS());
  }

  onMount(() => {
    open = computeInitialOpen(window.location.pathname);
    allowAnalytics = hasAnalytics();
    const p = new URLSearchParams(window.location.search);
    const v = p.get("utm_source");
    utmSource = v && v.trim() ? v.trim() : null;

    const unsub = page.subscribe(
      ($p) => (open = computeInitialOpen($p.url.pathname))
    );
    return () => unsub();
  });

  async function afterAccept() {
    await invalidateAll();
  }

  function acceptEssentials() {
    if (!agreeTOS || accepted) return;
    acceptEssentialOnly();
    accepted = true;
    open = false;
    afterAccept();
  }
  function acceptAll() {
    if (!agreeTOS || accepted) return;
    allowAnalytics = true;
    acceptAllCookies();
    accepted = true;
    open = false;
    afterAccept();
  }
</script>

{#if open}
  <div
    class="overlay"
    role="dialog"
    aria-modal="true"
    aria-label={$_("consent.aria")}
    transition:fade
  >
    <div class="modal" transition:scale={{ duration: 150 }}>
      <h1>{$_("consent.title")}</h1>

      <p class="lead">
        {$_("consent.lead")}
      </p>

      {#if utmSource}
        <p class="meta">
          {$_("consent.meta.source_prefix")} <strong>{utmSource}</strong>.
          {$_("consent.meta.source_note")}
        </p>
      {/if}

      <p class="links">
        {$_("consent.links.intro")}
        <a href="/about?p=terms" target="_blank" rel="noopener"
          >{$_("consent.links.terms")}</a
        >
        ·
        <a href="/about?p=privacy" target="_blank" rel="noopener"
          >{$_("consent.links.privacy")}</a
        >
        ·
        <a href="/about?p=cookies" target="_blank" rel="noopener"
          >{$_("consent.links.cookies")}</a
        >
      </p>

      <label class="check">
        <input type="checkbox" bind:checked={agreeTOS} />
        <span>{$_("consent.check.tos")}</span>
      </label>

      <!--  <label class="check">
        <input type="checkbox" bind:checked={allowAnalytics} disabled />
        <span>{$_("consent.check.analytics")}</span>
      </label> -->

      <div class="actions">
        <button
          class="btn ghost"
          on:click={acceptEssentials}
          disabled={!agreeTOS || accepted}
        >
          {$_("consent.buttons.essentials")}
        </button>

        <button
          class="btn primary"
          on:click={acceptAll}
          disabled={!agreeTOS || accepted}
        >
          {$_("consent.buttons.all")}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(3px);
    display: grid;
    place-items: center;
    z-index: 4000;
    padding: 16px;
  }
  .modal {
    width: min(720px, 100%);
    background: #353535;
    color: #fff;
    border: 1px solid #5a5a5a;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.45);
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 18px;
  }
  h1 {
    text-align: left;
    font-size: 1.7rem;
    font-weight: 600;
    margin: 0;
  }
  .lead {
    margin: 0;
    color: #d9d9d9;
    line-height: 1.45;
  }
  .links a {
    color: #ff6a00;
    text-decoration: underline;
  }
  .check {
    display: flex;
    gap: 0.6rem;
    align-items: flex-start;
  }
  .actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }
  .btn {
    border-radius: 12px;
    padding: 0.55rem 0.9rem;
    border: 1px solid #333;
    background: #1c1c1c;
    color: #fff;
    cursor: pointer;
  }
  .btn:hover {
    background: rgb(71, 71, 71);
  }
  .btn.primary {
    background: #ff6a00;
    border-color: #ff6a00;
    color: #111;
  }
  .btn.primary:hover {
    background: #ad4800;
    border-color: #ff6a00;
  }
  .btn[disabled] {
    opacity: 0.6;
    cursor: default;
  }
</style>
