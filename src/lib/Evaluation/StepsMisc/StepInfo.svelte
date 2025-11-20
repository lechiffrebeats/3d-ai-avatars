<script lang="ts">
  import { AVATAR_COLOR, TEXT_COLOR } from "$lib/Agent/Logic/Static";
  import { session } from "../EvalSystem";
  import { _ } from "$lib/i18n";

  const STEP_ID = 1;

  /* const PAUSE = {
    key: "(P)",
    labelKey: "eval2.pause.label",
    durKey: "eval2.pause.dur",
    color: "#444444",
  }; */

  const GAAIS = {
    key: "GAAIS",
    labelKey: "eval2.gaais.label",
    durKey: "eval2.gaais.dur",
    color: "#444444",
  };

  $: isAB = $session?.order === "AB";

  $: phases = [
    {
      key: "(A)",
      labelKey: isAB ? "eval2.interface.avatar" : "eval2.interface.text",
      durKey: "eval2.interface.durShort",
      color: isAB ? AVATAR_COLOR : TEXT_COLOR,
    },
    /* PAUSE, */
    {
      key: "(B)",
      labelKey: isAB ? "eval2.interface.text" : "eval2.interface.avatar",
      durKey: "eval2.interface.durShort",
      color: isAB ? TEXT_COLOR : AVATAR_COLOR,
    },
  ];
</script>

<div class="study-intro">
  <h1>{$session.steps[STEP_ID].title}</h1>

  <h1>{$_("eval2.intro.title")}</h1>

  <section>
    {#if isAB}
      {@html $_("eval2.order.ab", {
        avatarColor: AVATAR_COLOR,
        textColor: TEXT_COLOR,
      })}
    {:else}
      {@html $_("eval2.order.ba", {
        avatarColor: AVATAR_COLOR,
        textColor: TEXT_COLOR,
      })}
    {/if}
  </section>

  <h2 style="font-weight: bold;">{$_("eval2.phasesTitle")}</h2>

  <div class="plan">
    <div class="box">
      <strong>(D):</strong>
      {$_("eval2.demography.label")} —
      <small>{$_("eval2.demography.dur")}</small>
    </div>

    <div class="box">
      <strong>(G):</strong>
      {$_(GAAIS.labelKey)} — <small>{$_(GAAIS.durKey)}</small>
    </div>

    {#each phases as p}
      <div class="box" style="background:{p.color}">
        <strong>{p.key}:</strong>
        {$_(p.labelKey)} — <small>{$_(p.durKey)}</small>
      </div>
    {/each}

    <div class="box">
      <strong>(F):</strong>
      {$_("eval2.questionnaire.label")} —
      <small>{$_("eval2.questionnaire.dur")}</small>
    </div>

    <br />
    <h2 style="font-weight: bold;">Details:</h2>
    <section>
      {@html $_("eval2.focus")}
    </section>
  </div>
</div>

<style>
  .study-intro {
    display: flex;
    position: relative;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    color: white;
    display: flex;
    flex-direction: column;
    color: white;
  }

  section {
    margin-bottom: 0;
  }

  .box {
    margin: 0;
    padding: 0;
  }

  h1 {
    text-align: left;
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 1rem;
    margin-top: 0;
    padding: 0;
  }

  h2 {
    font-size: 1.25rem;
    font-weight: bold;
  }

  .plan {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin: 0;
    padding: 0;
  }
  .box {
    border: 1px solid #e6e6e6;
    background: #444444;
    border-radius: 10px;
    padding: 0.35rem 0.9rem;
    color: #fff;
  }

  small {
    color: #ffffff;
  }
</style>
