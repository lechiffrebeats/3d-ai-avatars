<script lang="ts">
  import "../app.css";
  import { BarLoader } from "svelte-loading-spinners";
  import { browser } from "$app/environment";
  import { navigating, page } from "$app/stores";
  import { onDestroy, onMount } from "svelte";
  import Header from "$lib/Misc/Header/Header.svelte";
  import { generalStore } from "$lib/Misc/generalStore";
  import { isMobile, updateIsMobile } from "$lib/Misc/about/device";
  import FooterFinal from "$lib/Misc/Footer/FooterFinal.svelte";
  import { writable } from "svelte/store";
  import { initialize_user_session } from "$lib/Misc/sessionStore";
  import ConsentBanner from "$lib/Misc/Cookies/ConsentBanner.svelte";
  import { waitLocale } from "$lib/i18n";
  import {
    consent,
    hasConsent,
    initLite,
    loadConsent,
    maybeInjectSpeedInsights,
  } from "$lib/Misc/Cookies/consent";

  let ready = $state(!browser);

  onMount(async () => {
    await waitLocale();
    ready = true;
  });

  let { children, data } = $props();
  const show = writable(false);

  if (data.utm_source)
    generalStore.update((s) => ({ ...s, utm_source: data.utm_source }));

  $effect(() => {
    if (!browser) return;
    const unsub = consent.subscribe((c) => {
      maybeInjectSpeedInsights(c?.analytics === true);
    });
    return () => unsub();
  });

  const onResize = () => {
    if (!browser) return;
    updateIsMobile(window.innerWidth);
  };

  onMount(() => {
    if (!browser) return;

    loadConsent();

    if (hasConsent()) initialize_user_session();
    updateIsMobile(window.innerWidth);
    $show = !hasConsent();

    const v = initLite();
    generalStore.update((s) => ({ ...s, LITE_MODE: v }));

    /* falls schlecheter device */
    const url = new URL(window.location.href);
    if (url.searchParams.has("lite")) {
      url.searchParams.delete("lite");
      history.replaceState({}, "", url);
    }

    window.addEventListener("resize", onResize);
  });

  $effect(() => {
    if (!browser) return;
    const h = $isMobile ? 48 : 0;
    document.documentElement.style.setProperty("--mobile-banner-h", `${h}px`);
    document.documentElement.style.setProperty(
      "--header-h",
      $isMobile ? "52px" : "64px"
    );
  });

  onDestroy(() => {
    if (!browser) return;
    if (browser) window.removeEventListener("resize", onResize);
  });
</script>

{#if !ready}
  <div class="route-loader">
    <BarLoader size="60" color="#FF3E00" unit="px" duration="1s" />
  </div>
{:else}
  {#if browser && $navigating}
    <div class="route-loader">
      <BarLoader size="60" color="#FF3E00" unit="px" duration="1s" />
    </div>
  {/if}

  {#if !$page.url.pathname.startsWith("/about")}
    <ConsentBanner />
  {/if}

  <div class="app" data-mobile={$isMobile}>
    <Header />
    <main>
      {@render children()}
    </main>

    {#if !$page.url.pathname.startsWith("/evaluation")}
      <FooterFinal />
    {/if}
  </div>
{/if}

<style>
  .app {
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
    padding-top: var(--top-offset);
    padding-bottom: var(--safe-bottom);
    overflow-x: hidden;
    -webkit-tap-highlight-color: transparent;
  }

  :global(header) {
    position: sticky;
    top: var(--top-offset);
    z-index: 1000;
  }

  main {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: var(--content-py) var(--content-px);
    width: 100%;
    margin: 0 auto;
    box-sizing: border-box;
    gap: 1rem;
  }

  .route-loader {
    position: fixed;
    inset: 0 0 auto 0;
    margin-top: var(--top-offset);
    z-index: 1999;
    display: grid;
    place-items: center;
    pointer-events: none;
  }

  /*   [data-mobile="true"] {
    --content-px: 1rem;
    --content-py: 0.75rem;
  }
 */
  @media (max-width: 768px) {
    :global(header .evaluatebox) {
      min-height: 44px;
      padding: 0.35rem 0.9rem;
    }
    main {
      gap: 0.75rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
      scroll-behavior: auto !important;
    }
  }
</style>
