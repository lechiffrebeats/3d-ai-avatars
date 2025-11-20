<script>
  import { _, locale } from "$lib/i18n";
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import langSVG from "$lib/images/Misc/lang.svg";

  let showLanguageChange = false;
  const currentYear = new Date().getFullYear();
  $: lang = ($locale || "en").toUpperCase();

  function toggleMenu() {
    showLanguageChange = !showLanguageChange;
  }
  function changeLanguage(l) {
    locale.set(l);
    showLanguageChange = false;
  }

  onMount(() => {
    if (!browser) return;
    const saved = localStorage.getItem("locale");
    if (saved) locale.set(saved);
    const unsub = locale.subscribe((v) => {
      if (v) localStorage.setItem("locale", v);
    });
    return () => unsub();
  });

  function onKey(e) {
    if (e.key === "Escape") showLanguageChange = false;
  }

  function clickOutside(node) {
    function handle(e) {
      if (!node.contains(e.target)) showLanguageChange = false;
    }
    document.addEventListener("mousedown", handle);
    document.addEventListener("touchstart", handle, { passive: true });
    return {
      destroy() {
        document.removeEventListener("mousedown", handle);
        document.removeEventListener("touchstart", handle);
      },
    };
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<footer class="footer" on:keydown={onKey}>
  <div class="inside">
    <div class="copyright insideElement">
      &copy; {currentYear} Ramón de Smit. All rights reserved. <!-- | Thesis at
      <a
        href="https://www.uni-bremen.de/"
        target="_blank"
        rel="noopener noreferrer">Universität Bremen</a
      > -->

      <div class="languageSwitcher" use:clickOutside>
        <button
          class="globe"
          aria-haspopup="menu"
          aria-expanded={showLanguageChange}
          aria-controls="lang-menu"
          aria-label="Change language"
          title="Change language"
          on:click={toggleMenu}
        >
          <img
            src={langSVG}
            class="lang-icon"
            alt=""
            width="16"
            height="16"
            decoding="async"
            loading="lazy"
          />
          {lang}
        </button>

        {#if showLanguageChange}
          <div class="language-menu" id="lang-menu" role="menu">
            <button
              role="menuitem"
              class="language-option"
              on:click={() => changeLanguage("en")}>English (EN)</button
            >
            <button
              role="menuitem"
              class="language-option"
              on:click={() => changeLanguage("de")}>Deutsch (DE)</button
            >
          </div>
        {/if}
      </div>
    </div>

    <div class="links insideElement">
      <div class="legalLinks">
        <a href="/about?p=about">{$_("footer.about")}</a>
        <a href="/about?p=impressum">{$_("footer.impressum")}</a>
        <a href="/about?p=privacy">{$_("footer.privacy")}</a>
        <a href="/about?p=terms">{$_("footer.terms")}</a>
        <a href="/about?p=cookies">{$_("footer.cookies")}</a>
      </div>
    </div>
  </div>
</footer>

<style>
  .footer {
    width: 100%;
    margin: 0;
    padding: 0;
    backdrop-filter: blur(2px);
    z-index: 2222;
    text-align: center;
    font-family: Arial, sans-serif;
    font-size: 0.7rem;
    background: rgba(0, 0, 0, 0.05);
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .inside {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.2rem 0;
    width: 100%;
    margin: 0 auto;
    gap: 0.55rem;
  }

  .insideElement {
    margin-left: 1rem;
    margin-right: 1rem;
  }

  .links {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .legalLinks {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .copyright {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.7rem;
    white-space: nowrap;
  }

  .languageSwitcher {
    position: relative;
    margin-left: 0.5rem;
  }
  .globe {
    border: none;
    border-radius: 9999px;
    padding: 0.3rem 0.5rem;
    cursor: pointer;
    background: rgba(0, 0, 0, 0.05);
    display: inline-flex;
    gap: 0.4rem;
    align-items: center;
    font-weight: 600;
  }
  .lang-icon {
    width: 13px;
    height: 13px;
    vertical-align: -2px;
  }
  .language-menu {
    position: absolute;
    bottom: calc(100% + 8px);
    right: 0;
    background: #ffffff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    z-index: 1000;
    padding: 0rem;
    display: grid;
    gap: 0.25rem;
    min-width: 160px;
  }
  .language-option {
    display: block;
    padding: 8px 12px;
    background: transparent;
    border: none;
    text-align: left;
    font-size: 0.9rem;
    cursor: pointer;
    color: #333;
    width: 100%;
    border-radius: 6px;
  }
  .language-option:hover {
    background-color: #f0f0f0;
  }

  @media (max-width: 720px) {
    .inside {
      flex-wrap: wrap;
      justify-content: center;
      gap: 0 0.4rem;
      padding: 0.4rem 0.75rem;
    }
    .copyright {
      white-space: normal;
      text-align: center;
      justify-content: center;
      line-height: 1;
      width: 100%;
    }
    .links {
      width: 100%;
      justify-content: center;
    }
    .legalLinks {
      justify-content: center;
      gap: 0.4rem 0.7rem;
    }
    .globe {
      padding: 0.35rem 0.6rem;
    }
  }
</style>
