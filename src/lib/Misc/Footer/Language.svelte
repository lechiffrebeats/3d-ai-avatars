<script lang="ts">
  import { clickOutside } from "../Other/Misc";
  import { browser } from "$app/environment";
  import { locale } from "$lib/i18n";
  import { languages } from "../sessionStore";
  import { chatStore } from "$lib/User/chatStore";

  let showDropdown = false;

  function selectLanguageLocal(index: number) {
    const lang = languages[index];
    const langcode = lang.code;

    if (!lang?.available) return;
    showDropdown = false;
    $locale = lang.code;

    chatStore.update((s) => ({ ...s, userLanguage: langcode }));

    if (browser) {
      const url = new URL(window.location.href);
      url.searchParams.set("lang", langcode);
      window.history.replaceState({}, "", url);
      try {
        localStorage.setItem("locale", langcode);
      } catch {}
    }
  }

  $: idxFromLocale = languages.findIndex((l) => l.code === $locale);
  $: currentLang = idxFromLocale >= 0 ? idxFromLocale : 1;
  $: selected = languages[currentLang] ?? languages[1];

  if (browser) {
    const url = new URL(window.location.href);
    const langParam = url.searchParams.get("lang");
    const fromUrl =
      langParam && languages.findIndex((l) => l.code === langParam);
    if (typeof fromUrl === "number" && fromUrl >= 0) {
      selectLanguageLocal(fromUrl);
    } else {
      try {
        const saved = localStorage.getItem("locale");
        const fromLS = saved && languages.findIndex((l) => l.code === saved);
        if (typeof fromLS === "number" && fromLS >= 0)
          selectLanguageLocal(fromLS);
      } catch {}
    }
  }
</script>

<div
  use:clickOutside
  on:click_outside={() => (showDropdown = false)}
  id="lang-switcher"
  role="group"
  aria-label="Language switcher"
>
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <img
    src={selected.flag}
    alt={selected.label}
    width="40"
    height="40"
    on:click|preventDefault|stopPropagation={() => (showDropdown = true)}
  />

  {#if showDropdown}
    <div class="dropdown" role="menu" aria-label="Choose language">
      {#each languages as lang, i}
        {#if i !== currentLang}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
          <img
            src={lang.flag}
            title={lang.label}
            aria-label={lang.label}
            width="32"
            height="32"
            alt={lang.label}
            aria-disabled={!lang.available}
            class:notavailable={!lang.available}
            on:click={() => (lang.available ? selectLanguageLocal(i) : null)}
          />
        {/if}
      {/each}
    </div>
  {/if}
</div>

<style>
  #lang-switcher {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    cursor: pointer;
    overflow: visible;
    z-index: 1000;
    position: relative;
  }

  .notavailable {
    opacity: 0.5;
  }

  #lang-switcher > img {
    width: 100%;
    height: auto;
    aspect-ratio: 1 / 1;
    object-fit: contain;
    z-index: 1999;
    display: block;
  }

  #lang-switcher > img:hover {
    filter: brightness(0.9);
  }

  .dropdown {
    position: absolute;
    top: 50px;
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    padding: 6px;
    z-index: 22999;
  }

  .dropdown img {
    width: 30px;
    height: 30px;
    margin: 2px 0;
    cursor: pointer;
    transition: transform 0.2s;
    display: block;
    object-fit: contain;
  }

  .dropdown img:hover {
    transform: scale(1.1);
  }
</style>
