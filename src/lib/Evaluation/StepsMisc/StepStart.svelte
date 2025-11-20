<script lang="ts">
  import evalGIF from "$lib/images/Phases/eval.gif";
  import Gender from "$lib/Misc/Footer/Gender.svelte";
  import { _ } from "$lib/i18n";
  /* import surveycicleIMG from "$lib/images/Misc/ssurvey_circle_logo.svg"; */
  const STEP_ID = 0;
</script>

<div class="intro">
  <img
    src={evalGIF}
    alt={$_("eval.alt")}
    class="logo"
    width="256"
    height="256"
    decoding="async"
    loading="lazy"
    fetchpriority="low"
    draggable="false"
  />
  <h1>{$_("eval.title")}</h1>

  <ul class="bullets" role="list">
    <li data-ico="🎓">{@html $_("eval.bullets.purpose")}</li>
    <li data-ico="💬">{@html $_("eval.bullets.storage")}</li>
    <li data-ico="🔁">
      {@html $_("eval.bullets.avatar")}
      <div class="gender-switcher">
        <Gender />
      </div>
    </li>
    <!-- <li data-ico="🕰️">{$_("eval.bullets.latency")}</li> -->
    <li data-ico="🙅">{$_("eval.bullets.noPersonalData")}</li>
    <li data-ico="💻">
      {@html $_("eval.bullets.system")}
    </li>
    <li data-ico="🔊">{$_("eval.bullets.sound")}</li>
    <li data-ico="🌐">{$_("eval.bullets.language")}</li>
    <li data-ico="🎤">{$_("eval.bullets.microphone")}</li>
    <li data-ico="⏱️">{$_("eval.bullets.duration")}</li>
    <!-- <img src={surveycicleIMG} class="surveycicle" alt="" /> -->
    <li data-ico="📝">
      {@html $_("eval.bullets.surveycicle")}
    </li>
  </ul>

  <p class="terms">
    {@html $_("eval.terms")}
  </p>
</div>

<style>
  .gender-switcher {
    position: relative;
  }

  .intro {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    color: white;
    gap: 0.75rem;
    max-width: 620px;
    margin: 0 auto;
  }

  h1 {
    text-align: left;
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 0.2rem;
    margin-top: 0;
    padding: 0;
  }

  .logo {
    width: 96px;
    height: 96px;
    object-fit: contain;
  }

  .bullets {
    margin: 0.2rem auto 0;
    padding-inline-start: 1.25rem;
    max-width: 270px;
    text-align: left;
    list-style-position: outside;
  }

  .bullets li {
    font-size: 0.94rem;
    line-height: 1.35;
    margin: 0.3rem 0;
  }

  .bullets li::marker {
    content: attr(data-ico) " ";
    font-size: 1.15rem;
  }

  .terms {
    font-size: 0.92rem;
    margin: 0.6rem 0 0;
  }

  .terms a {
    text-decoration: none;
  }

  .terms a:hover {
    text-decoration: underline;
  }
</style>
