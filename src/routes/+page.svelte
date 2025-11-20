<script>
  import daivd_WEBM from "$lib/images/avatar/avatar_scaled_1.webm";
  import daivd_APNG from "$lib/images/avatar/male.png";
  import { goto } from "$app/navigation";
  import { _ } from "@rgglez/svelte-i18n";
  import { onMount } from "svelte";

  let canPlayWebm = false;

  onMount(() => {
    const ua = navigator.userAgent;
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
    const v = document.createElement("video");
    const support =
      v.canPlayType('video/webm; codecs="vp9"') || v.canPlayType("video/webm");
    canPlayWebm = !!support && !isSafari;
  });
</script>

<svelte:head>
  <title>3D-KI-Avatar</title>
  <meta name="description" content="3D-KI-Avatar" />
</svelte:head>

<section>
  <h1 class="avatar-title">
    {#if canPlayWebm}
      <!-- svelte-ignore element_invalid_self_closing_tag -->
      <video
        class="avatar"
        src={daivd_WEBM}
        autoplay
        loop
        muted
        playsinline
        preload="auto"
        poster={daivd_APNG}
        width="256"
        height="256"
        aria-label="Avatar animation"
        style="display:block;background:transparent"
      />
    {:else}
      <picture>
        <source srcset={daivd_APNG} type="image/png" />
        <img
          class="avatar"
          src={daivd_APNG}
          alt="Avatar"
          width="256"
          height="256"
          decoding="async"
          loading="lazy"
          draggable="false"
        />
      </picture>
    {/if}
    {$_("title")}
    <br />
  </h1>

  <h2 class="lead">
    {$_("subtitle")}
  </h2>

  <button
    aria-label={$_("cta")}
    class="btn"
    on:click={() => goto("/evaluation")}
  >
    {$_("cta")} 👀
  </button>
</section>

<style>
  section {
    margin-top: 15px;
    min-height: 70vh;
    min-height: 70svh;
    display: grid;
    grid-auto-rows: min-content;
    justify-items: center;
    align-content: center;
    text-align: center;
    gap: 0.6rem;
    padding-block: clamp(0.5rem, 0, 1rem);
  }

  .avatar-title {
    display: grid;
    justify-items: center;
  }

  h1 {
    margin: 0;
    color: #4b5563;
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 700;
    line-height: 1.1;
  }

  h2 {
    margin: 0;
    font-size: clamp(1rem, 2vw, 1.25rem);
    max-width: 40rem;
    color: #4b5563;
    line-height: 1.4;
  }

  .btn {
    margin-top: 0.25rem;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 2rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    color: #fff;
    background: #f65200;
    transition:
      background 0.2s ease,
      transform 0.1s ease;
  }

  .btn:hover {
    background: #d54300;
  }
  .btn:active {
    transform: translateY(1px);
  }

  .avatar {
    max-width: min(90vw, 500px);
    max-height: 50vh;
    max-height: 40svh;
    width: auto;
    height: auto;
    display: block;
    object-fit: contain;
    -webkit-mask-image: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 1) 85%,
      rgba(0, 0, 0, 0) 100%
    );
    -webkit-mask-repeat: no-repeat;
    -webkit-mask-size: 100% 100%;
    mask-image: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 1) 85%,
      rgba(0, 0, 0, 0) 100%
    );
    mask-repeat: no-repeat;
    mask-size: 100% 100%;
  }

  @media (max-width: 680px) {
    .avatar {
      max-width: 60vw;
    }

    h2 {
      margin: 0;
      font-size: clamp(1rem, 2vw, 1.25rem);
      max-width: 19rem;
      color: #4b5563;
    }
  }
</style>
