<script>
  import { page } from "$app/state";
  import logo from "$lib/images/avatar/image.svg";
  import Language from "../Footer/Language.svelte";
  import { _ } from "$lib/i18n";
  import MenuButton from "./MenuButton.svelte";
  import EvalButton from "./EvalButton.svelte";
</script>

<header>
  <div style="display:flex; align-items:center; gap:.75rem;">
    <MenuButton activePath={page.url.pathname} />
    <div class="brand">
      <a href="/"><img src={logo} loading="lazy" alt="Logo" class="logo" /></a>
    </div>
  </div>

  <nav class="desktop-nav">
    <ul style="align-items: center;">
      <li class:active={page.url.pathname === "/"}>
        <a href="/">{$_("header.nav.start")}</a>
      </li>
      <li class:active={page.url.pathname === "/about"}>
        <a href="/about">{$_("header.nav.about")}</a>
      </li>
      <li class:active={page.url.pathname === "/report"}>
        <a href="/report">{$_("header.nav.feedback")}</a>
      </li>
      <li class:active={page.url.pathname.startsWith("/evaluation")}>
        <a href="/evaluation">{$_("header.nav.evaluation")}</a>
      </li>
      {#if page.url.hostname === "localhost"}
        <li class:active={page.url.pathname.startsWith("/Results")}>
          <a href="/Results">{$_("header.nav.results")}</a>
        </li>
      {/if}
    </ul>
  </nav>

  <div class="headbox">
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <EvalButton />
    <Language />
  </div>
</header>

<style>
  .headbox {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  header {
    display: flex;
    align-items: center;
    color: white;
    justify-content: space-between;
    padding: 0.6rem 1.5rem;
    background: rgba(135, 135, 135, 0.3);
    backdrop-filter: blur(5px);
    z-index: 1000;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }
  .brand {
    display: flex;
    align-items: center;
    margin: 0;
    height: fit-content;
  }
  .logo {
    margin: 0;
    padding: 0;
    height: 17px;

    filter: invert(1);
    width: auto;
  }

  nav ul {
    color: white;
    list-style: none;
    display: flex;
    gap: 1.5rem;
    margin: 0;
    padding: 0;
  }
  nav li a {
    text-decoration: none;
    font-weight: 600;
    font-size: 0.9rem;
    color: white;
    position: relative;
    padding: 0.25rem 0;
    transition: color 0.2s ease;
  }
  nav li a:hover {
    color: var(--color-theme-1, #2563eb);
  }
  nav li.active a::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -0.3rem;
    width: 100%;
    height: 2px;
    background: var(--color-theme-1, #2563eb);
    border-radius: 1px;
  }
  .desktop-nav {
    display: block;
  }
  @media (max-width: 768px) {
    .desktop-nav {
      display: none;
    }
  }
</style>
