<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { _ } from "$lib/i18n";
  import { onMount } from "svelte";
  import { generalStore } from "$lib/Misc/generalStore";

  const registry = {
    about: () => import("$lib/Misc/about/About.svelte"),
    impressum: () => import("$lib/Misc/about/Impressum.svelte"),
    privacy: () => import("$lib/Misc/about/Privacy.svelte"),
    terms: () => import("$lib/Misc/about/Terms.svelte"),
    cookies: () => import("$lib/Misc/about/Cookies.svelte"),
    oss: () => import("$lib/Misc/about/Licences.svelte"),
    eval: () => import("$lib/Misc/about/EvaluationInfo.svelte"),
    system: () => import("$lib/Misc/about/System.svelte"),
  } as const;

  type Key = keyof typeof registry;

  const titleKeys: Record<Key, string> = {
    about: "about.tabs.about",
    impressum: "about.tabs.impressum",
    privacy: "about.tabs.privacy",
    terms: "about.tabs.terms",
    cookies: "about.tabs.cookies",
    oss: "about.tabs.oss",
    system: "about.tabs.system",
    eval: "about.tabs.eval",
  };

  let Comp: any = null;
  let current: Key = "about";
  let token = 0;

  $: {
    const q = $page.url.searchParams.get("p")?.toLowerCase() as Key | undefined;
    const k = (q && q in registry ? q : "about") as Key;
    if (k !== current) current = k;
  }

  $: load(current);

  async function load(k: Key) {
    const my = ++token;
    Comp = null;
    try {
      const mod = await registry[k]();
      if (my !== token) return;
      Comp = mod.default;
      for (const kk of Object.keys(registry) as Key[]) {
        if (kk !== k) registry[kk]().catch(() => {});
      }
    } catch {
      Comp = null;
    }
  }

  async function gotoKey(k: Key) {
    if (k === current) return;
    current = k;
    await goto(`/about?p=${k}`, { replaceState: true, noscroll: true });
    document
      .getElementById(`sec-${k}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  onMount(() => {
    $generalStore.SHOW_EVALUATE = false;
  });
</script>

<svelte:head>
  <title>About this thesis</title>
  <meta name="description" content={$_("about.meta.description")} />
</svelte:head>

<section class="wrap">
  <h1 class="title">{$_("about.h1")}</h1>

  <nav class="tabs" aria-label={$_("about.aria.tabs")}>
    {#each Object.keys(registry) as Key[] as k (k)}
      <button
        class="tab {current === k ? 'active' : ''}"
        on:click={() => gotoKey(k)}
        aria-current={current === k ? "page" : undefined}
      >
        {$_(titleKeys[k])}
      </button>
    {/each}
  </nav>

  <div class="panel" id={"sec-" + current}>
    {#if Comp}
      {#key current}
        <svelte:component this={Comp} />
      {/key}
    {:else}
      <div class="loading">{$_("about.loading")}</div>
    {/if}
  </div>

  <div class="deeplinks">
    {$_("about.deeplinks.label")}
    <a href="/about?p=about">{$_("about.tabs.about")}</a>
    <a href="/about?p=impressum">{$_("about.tabs.impressum")}</a>
    <a href="/about?p=privacy">{$_("about.tabs.privacy")}</a>
    <a href="/about?p=terms">{$_("about.tabs.terms")}</a>
    <a href="/about?p=cookies">{$_("about.tabs.cookies")}</a>
    <a href="/about?p=oss">{$_("about.tabs.oss")}</a>
    <a href="/about?p=eval">{$_("about.tabs.eval")}</a>
  </div>
</section>

<style>
  .wrap {
    max-width: 960px;
    margin: 0 auto;
    padding: 1rem;
  }
  .title {
    margin: 0 0 0.75rem;
  }
  .tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }
  .tab {
    border: 1px solid #ddd;
    background: #fff;
    padding: 0.45rem 0.7rem;
    border-radius: 999px;
    cursor: pointer;
    font-size: 0.95rem;
  }
  .tab.active {
    background: #111;
    color: #fff;
    border-color: #111;
  }
  .panel {
    border: 1px solid #eee;
    border-radius: 12px;
    background: #fff;
    padding: 1rem;
  }
  .loading {
    color: #666;
  }
  .deeplinks {
    margin-top: 0.75rem;
    color: #666;
    font-size: 0.9rem;
  }
  .deeplinks a {
    color: inherit;
    text-decoration: underline;
  }
</style>
