<script lang="ts">
  import { _ } from "$lib/i18n";
  import { alreadySwitched, currEvalType, next } from "../EvalSystem";

  import loading from "$lib/images/Misc/loading.gif";
  import { onMount } from "svelte";
  import { get } from "svelte/store";
  import { EVAL_TYPE } from "../Evaluation";
  import { initializedTrigger } from "$lib/Agent/Agent";
  let inited = false;

  onMount(() => {
    if (!$alreadySwitched) {
      alreadySwitched.set(true);
      const evalTypeSoFar = get(currEvalType);
      currEvalType.set(
        evalTypeSoFar === EVAL_TYPE.AVATAR ? EVAL_TYPE.TEXT : EVAL_TYPE.AVATAR
      );
      inited = true;
      initializedTrigger.on($currEvalType, () => {
        next();
      });
    }
  });
</script>

{#if inited}
  <section class="timer" style="margin-top: 1rem;">
    <h2>
      Switching to {$currEvalType} Interface!
    </h2>
    <img
      src={loading}
      width="64"
      height="64"
      class="loading-gif"
      alt={$_("evaluator.loading")}
    />
  </section>
{:else}
  <h2>Already switched Interfaces, please click next</h2>
{/if}

<style>
  .timer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2.5rem;
  }

  h2 {
    margin: 0;
    padding: 0;
    font-size: 1.25rem;
    font-weight: bold;
    color: #ffffff;
  }
</style>
