<script lang="ts">
  import { session } from "../EvalSystem";
  import { _ } from "$lib/i18n";

  import AnswerSwitcher from "./TaskQuestionSwitcher.svelte";
  import Aufgabe from "../Misc/Aufgabe.svelte";
  import Question from "./EvalQuestionSwitcher.svelte";

  $: step = $session?.steps?.[$session?.currStep ?? 0] ?? null;

  $: subtitleText =
    (step?.subtitleKey ? $_(step.subtitleKey) : step?.subtitle) ?? "";

  $: linkTitleText =
    (step?.link?.title ? $_(step.link.title) : step?.link?.titleKey) ?? "";
</script>

<div class="Container">
  {#if step?.isTask}
    <Aufgabe
      FullCurrStep={step}
      topText={subtitleText}
      dontShowReplyField={step.dontShowReplyField}
    />
  {:else if step && (step.subtitleKey || step.subtitle) && step.showSubtitle}
    <h2>{subtitleText}</h2>
  {/if}

  {#if step.stable_key === "gaais-block-v1"}
    <section class="gaais-block">
      <h1 style=" margin-bottom: 1rem;">{$_("gaaisInfo.block.title")}</h1>

      {#if step.stable_key === "gaais-block-v1"}
        <small
          >Learn more about the GAAIS here: <a
            class="link"
            style="color: cyan;"
            target="_blank"
            href="https://www.tandfonline.com/doi/full/10.1080/10447318.2022.2085400"
            >GAAIS Schepman, A., & Rodway, P. (2022)</a
          ></small
        >
      {/if}
      <br /><br />
      <!--  <h2>
        {$_("gaaisInfo.block.instructions.title")}
      </h2> -->
      <p>{@html $_("gaaisInfo.block.instructions.body")}</p>
      <br />

      <b>{$_("gaaisInfo.block.response.title")}</b><br />
      <p>{@html $_("gaaisInfo.block.response.body")}</p>
      <br />
    </section>
  {/if}

  {#if step.stable_key === "avatar-tlx-v1" || step.stable_key === "text-tlx-v1"}
    <small>
      Learn more about this questionare here:
      <a
        class="link"
        style="color: cyan;"
        target="_blank"
        rel="noopener noreferrer"
        href="https://www.sciencedirect.com/science/article/abs/pii/S0166411508623869"
      >
        NASA—TLX
      </a>
      ·
      <a
        class="link"
        style="color: cyan;"
        target="_blank"
        rel="noopener noreferrer"
        href="https://ntrs.nasa.gov/api/citations/20000021488/downloads/20000021488.pdf"
      >
        Hart & Staveland (1986/1988) — Paper & Pencil Package (PDF)
      </a>
    </small>
  {/if}

  {#if step && step.isTask && !step.dontShowReplyField}
    <AnswerSwitcher {step} />
  {/if}

  {#if step?.eval_questions}
    {#each step.eval_questions as q}
      <Question questionID={q.id} stepId={step.step_id} />
    {/each}
  {/if}
</div>

<style>
  small {
    font-size: 0.8rem;
    margin-bottom: 10px;
    margin-top: 5px;
  }

  .Container {
    display: flex;
    position: relative;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    color: white;
    gap: 0.4rem;
  }

  h1 {
    text-align: left;
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 0.2rem;
    margin-top: 0;
    padding: 0;
  }

  h2 {
    font-size: 1.25rem;
    font-weight: bold;
    margin: 0;
    padding: 0;
  }

  .link {
    margin: 0;
    padding: 0;
    color: var(--primary);
  }
</style>
