<script lang="ts">
  import { onMount } from "svelte";
  import { clickOutside } from "../Other/Misc";
  import { browser } from "$app/environment";
  import { triggerAction } from "$lib/Agent/Agent";
  import maleSVG from "$lib/images/avatar/male.png";
  import femaleSVG from "$lib/images/avatar/female.png";
  import otherSVG from "$lib/images/avatar/other.svg";
  import { set_avatar_gender } from "../sessionStore";

  const genders = [
    {
      key: "male",
      icon: maleSVG,
      label: "Männlich",
      name: "David",
      disabled: false,
    },
    {
      key: "female",
      icon: femaleSVG,
      label: "Weiblich",
      name: "Susanne",
      disabled: false,
    },
    {
      key: "diverse",
      icon: otherSVG,
      label: "Divers",
      name: "Divers",
      disabled: true,
    },
  ];

  let currentIndex = 0;
  let showDropdown = false;

  function applyGender(index: number) {
    if (genders[index]?.disabled || genders[index]?.key === "diverse") return;
    currentIndex = index;
    const key = genders[currentIndex].key as "male" | "female";
    set_avatar_gender(key);

    if (browser) {
      const url = new URL(window.location.href);
      url.searchParams.set("gender", key);
      window.history.replaceState({}, "", url);
    }
  }

  /* bruh */
  function switchGender(index) {
    applyGender(index); /* das refresht noch nicth */
    const name = genders[index].name;
    triggerAction?.emit?.("SWITCH_GENDER", name); /* DAS SCHON */
  }

  onMount(() => {
    if (!browser) return;
    const g = (
      new URLSearchParams(window.location.search).get("gender") || ""
    ).toLowerCase();

    const idx = genders.findIndex((x) => x.key === g && !x.disabled);
    if (idx >= 0) applyGender(idx);
    else applyGender(0);
  });
</script>

<div
  id="gender-switcher"
  use:clickOutside
  on:click_outside={() => (showDropdown = false)}
>
  <button
    class="switcher-btn"
    aria-haspopup="menu"
    aria-expanded={showDropdown}
    on:click={() => (showDropdown = !showDropdown)}
  >
    <img
      class="icon"
      src={genders[currentIndex].icon}
      alt=""
      width="24"
      height="24"
      decoding="async"
      loading="lazy"
      fetchpriority="low"
      draggable="false"
    />
    <span class="name">{genders[currentIndex].name}</span>
    <span class="caret" aria-hidden="true">▾</span>
  </button>

  {#if showDropdown}
    <div class="dropdown" role="menu">
      {#each genders as g, i}
        {#if i !== currentIndex}
          <button
            class="item {g.disabled ? 'disabled' : ''}"
            role="menuitem"
            aria-disabled={g.disabled}
            disabled={g.disabled}
            title={g.disabled ? "Coming soon" : g.label}
            on:click={() => {
              if (!g.disabled) switchGender(i);
              showDropdown = false;
            }}
          >
            <img class="icon" src={g.icon} alt="" aria-hidden="true" />
            {#if g.disabled}
              <span class="label">{g.name}</span>
              <span class="badge" style="font-size: 0.6rem;">Coming soon</span>
            {:else}
              <span class="label">{g.name}</span>
              <span class="sub">{g.label} </span>
            {/if}
          </button>
        {/if}
      {/each}
    </div>
  {/if}
</div>

<style>
  #gender-switcher {
    margin-top: 6px;
    position: relative;
    z-index: 2;
  }

  .switcher-btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    height: 53px;
    padding: 6px 12px 6px 10px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid #ffffff;
    backdrop-filter: blur(6px);
    cursor: pointer;
    transition:
      transform 0.12s ease,
      background 0.12s ease,
      border-color 0.12s ease;
    color: #fff;
  }
  .switcher-btn:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.28);
    transform: translateY(-1px);
  }
  .switcher-btn:active {
    transform: translateY(0);
  }

  .icon {
    width: 50px;
    height: 50px;
    display: block;
  }

  .name {
    font-size: 0.95rem;
    font-weight: 600;
    white-space: nowrap;
  }

  .caret {
    margin-left: 6px;
    font-size: 0.8rem;
    line-height: 1;
    opacity: 0.9;
    user-select: none;
  }

  .dropdown {
    position: absolute;
    top: calc(100% + 2px);
    left: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 6px;
    min-width: 190px;
    background: #383838;
    border: 1px solid #ffffff;
    border-radius: 12px;
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.35);
  }

  .item {
    display: grid;
    grid-template-columns: 24px 1fr auto;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 8px 10px;
    border-radius: 10px;
    background: transparent;
    border: none;
    color: #fff;
    cursor: pointer;
    transition:
      background 0.12s ease,
      transform 0.12s ease,
      opacity 0.12s ease;
    text-align: left;
  }
  .item:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateX(2px);
  }
  .item.disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
  }

  .label {
    font-size: 0.95rem;
    font-weight: 600;
  }
  .sub {
    font-size: 0.78rem;
    opacity: 0.75;
    margin-left: 8px;
  }

  .badge {
    font-size: 0.7rem;
    padding: 2px 6px;
    border-radius: 999px;
    background: #232326;
    border: 1px solid #3a3a3f;
    opacity: 0.9;
    justify-self: end;
  }
</style>
