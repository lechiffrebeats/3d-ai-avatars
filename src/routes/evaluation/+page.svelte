<script lang="ts">
  import { page } from "$app/stores";
  import { currEvalType } from "$lib/Evaluation/EvalSystem";
  import { EVAL_TYPE } from "$lib/Evaluation/Evaluation";
  import AvatarWrapper from "$lib/Agent/Logic/AvatarWrapper.svelte";
  import { isMobile, mobielWarningIgnored } from "$lib/Misc/about/device";
  import TextOnlyInterface from "$lib/Modalities/Input_Text.svelte";
  import { onMount } from "svelte";
  import MobileWarning from "$lib/Misc/Other/MobileWarning.svelte";
  import { generalStore } from "$lib/Misc/generalStore";
  import Evaluator from "$lib/Evaluation/Evaluator.svelte";

  let localhost = false;
  onMount(() => {
    const url = $page.url;
    if (url.hostname === "localhost") localhost = true;
  });
</script>

<svelte:head>
  <title>Traust du mir? | Evaluation</title>
  <meta name="description" content="Ai Tutor" />
</svelte:head>

{#if $isMobile && $page.url.pathname.startsWith("/evaluation") && !$mobielWarningIgnored}
  <MobileWarning />
{:else if $mobielWarningIgnored || !$isMobile}
  <!-- {#if $generalStore.SHOW_EVALUATE}
    <Evaluator />
  {/if} -->

  {#if true /* $currEvalType === EVAL_TYPE.AVATAR */}
    <AvatarWrapper />
  {:else if $currEvalType === EVAL_TYPE.TEXT}
    <TextOnlyInterface />
  {/if}
{/if}
