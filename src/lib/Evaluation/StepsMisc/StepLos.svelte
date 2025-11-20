<script lang="ts">
  import { currEvalType } from "../EvalSystem";
  import letsgoGIF from "$lib/images/Phases/letsgo.gif";
  import OrangeBall from "../Misc/OrangeBall.svelte";
  import avatarPNG from "$lib/images/Phases/avatar.jpg";
  import textPNG from "$lib/images/Phases/text.jpg";

  import { _ } from "$lib/i18n";

  $: modeLabel =
    $currEvalType === "AVATAR" ? $_("task.mode.avatar") : $_("task.mode.text");
</script>

<div class="study-intro">
  <h1>
    {$currEvalType === "AVATAR" ? "Avatar" : "Text"}-Interface {$_("task.h2")}
  </h1>
  <p>{@html $_("task.intro", { values: { modeLabel } })}</p>
  <div class="hint">
    <div class="header">{$_("task.perStep.title")}</div>
    <section class="tooltip">
      <ul class="tips">
        <li>{$_("task.perStep.items.useChat")}</li>
        <li>{@html $_("task.perStep.items.input")}</li>
        <li>{@html $_("task.perStep.items.answerField")}</li>
        <li>{@html $_("task.perStep.items.rateAndNext")}</li>
      </ul>
    </section>
  </div>

  <div class="hint">
    <div class="header" style="background-color: #ff5100;">
      {$_("task.tips.t1.title")}
    </div>
    <section class="tooltip">
      {@html $_("task.tips.t1.body")}
      <OrangeBall />
      {@html $_("task.tips.t1.body2")}
    </section>
  </div>
</div>

<style>
  .header {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    background-color: #262626;
    padding: 0.5rem 0.7rem;
    border-bottom: white 1px solid;
    font-weight: 600;
  }
  .hint {
    overflow: hidden;
    border-radius: 10px;
    border: white 1px solid;
  }
  .tooltip {
    justify-content: flex-start;
    padding: 0.5rem;
  }

  .study-intro {
    display: grid;
    place-items: center;
    text-align: center;
    gap: 1rem;
    color: #fff;
  }

  h1 {
    text-align: left;
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 0rem;
    margin-top: 0;
    padding: 0;
  }

  .sub {
    margin: 0.25rem 0 0;
    font-size: 1rem;
    opacity: 0.95;
  }
  .tips {
    text-align: left;
    max-width: 720px;
    margin: 0.25rem auto 0;
    padding-left: 1.1rem;
    line-height: 1.45;
  }
  .tips li {
    margin: 0.25rem 0;
  }
  .hint {
    opacity: 0.9;
    font-size: 0.95rem;
  }
</style>
