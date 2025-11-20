<script>
  import { _ } from "@rgglez/svelte-i18n";
  import { isMobile } from "../about/device";
  import menu from "$lib/images/Input/menu.svg";
  import Volume from "../Other/Volumes.svelte";
  import EnvSwitcher from "../Footer/EnvSwitcher.svelte";
  import Switch from "../Other/Switch.svelte";

  const menuItems = [
    { href: "/", label: $_("header.nav.start") },
    { href: "/about", label: $_("header.nav.about") },
    { href: "/report", label: $_("header.nav.feedback") },
    {
      href: "/evaluation",
      label: $_("header.nav.evaluation"),
      match: "/evaluation",
    },
    { href: "/Results", label: $_("header.nav.results"), match: "/Results" },
    { divider: true },
    { href: "/about?p=about", label: $_("footer.about"), match: "/about" },
    {
      href: "/about?p=impressum",
      label: $_("footer.impressum"),
      match: "/about",
    },
    { href: "/about?p=privacy", label: $_("footer.privacy"), match: "/about" },
    { href: "/about?p=terms", label: $_("footer.terms"), match: "/about" },
    { href: "/about?p=cookies", label: $_("footer.cookies"), match: "/about" },
  ];

  const desktopItems = [
    { href: "/", label: $_("header.nav.start") },
    { href: "/about?p=about", label: $_("footer.about"), match: "/about" },
    {
      href: "/about?p=impressum",
      label: $_("footer.impressum"),
      match: "/about",
    },
    { href: "/about?p=privacy", label: $_("footer.privacy"), match: "/about" },
    { href: "/about?p=terms", label: $_("footer.terms"), match: "/about" },
    { href: "/about?p=cookies", label: $_("footer.cookies"), match: "/about" },
  ];

  export let activePath = "";
  let open = false;
  let root;

  const toggle = () => (open = !open);
  const close = (e) => {
    if (open && root && !root.contains(e.target)) open = false;
  };
  const onKey = (e) => e.key === "Escape" && (open = false);

  $: items = $isMobile ? menuItems : desktopItems;
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="menu" bind:this={root} on:keydown={onKey}>
  <button
    class="hamburger"
    aria-haspopup="menu"
    aria-expanded={open}
    on:click={toggle}
  >
    <img
      src={menu}
      class="icon"
      width="24"
      height="24"
      alt=""
      style="filter: invert(1);"
    />
  </button>

  {#if open}
    <!-- prevent clicks inside from closing -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <ul
      class="panel"
      role="menu"
      on:click|stopPropagation
      on:mousedown|stopPropagation
      on:touchstart|stopPropagation
    >
      {#each items as it}
        {#if it.divider}
          <li class="divider" role="separator" aria-hidden="true"></li>
        {:else}
          <li role="none">
            <a
              role="menuitem"
              href={it.href}
              class:active={activePath.startsWith(it.match || it.href)}
              on:click={() => (open = false)}
            >
              {it.label}
            </a>
          </li>
        {/if}
      {/each}

      <li role="none" class="slot">
        <Volume />
      </li>
      <li role="none" class="slot">
        Scene Background:
        <EnvSwitcher />
      </li>
      <li role="none" class="slot">
        <Switch />
      </li>
    </ul>
  {/if}
</div>

<!-- close on outside click -->
<svelte:window on:click={close} on:touchstart={close} />

<style>
  .menu {
    position: relative;
    align-items: center;
    z-index: 5001;
  }
  .hamburger {
    width: 36px;
    height: 32px;
    display: grid;
    place-items: center;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0 1px;
  }
  .icon:hover {
    transform: scale(1.07);
    transition: transform 0.2s ease-in-out;
  }

  .panel {
    position: absolute;
    top: 42px;
    left: 0;
    background: rgba(72, 72, 72, 1);
    backdrop-filter: blur(16px);
    border: 1px solid #fff;
    border-radius: 12px;
    padding: 8px;
    margin: 0;
    list-style: none;
    min-width: 180px;
    z-index: 1001;
  }

  .panel a,
  .slot {
    display: block;
    padding: 8px 10px;
    border-radius: 8px;
    color: white;
    text-decoration: none;
    font-size: 0.92rem;
    font-weight: 600;
  }
  .panel a:hover {
    background: rgba(255, 255, 255, 0.08);
  }
  .panel a.active {
    color: var(--color-theme-1, #2563eb);
  }

  .divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.25);
    margin: 6px 4px;
  }

  @media (max-width: 768px) {
    .menu {
      display: flex;
    }
  }
</style>
