<script lang="ts">
  import { browser } from "$app/environment";
  import { page } from "$app/stores";
  import {
    eval_session_initialized,
    startEval,
  } from "$lib/Evaluation/EvalSystem";
  import { skipTimeoutHint } from "$lib/General.js";
  import { generalStore } from "$lib/Misc/generalStore";
  import { onDestroy, onMount } from "svelte";

  /** @type {import('./$types').LayoutProps} */
  let { data, children } = $props();
  let intervalId: number | null = null;

  onMount(async () => {
    if (!$eval_session_initialized) {
      await startEval();
    }
    generalStore.update((s) => ({ ...s, SHOW_EVALUATE: true }));
  });

  const check = () => {
    if (
      $page.url.pathname.startsWith("/evaluation") &&
      !$skipTimeoutHint &&
      $eval_session_initialized &&
      !$generalStore.SHOW_EVALUATE
    ) {
      generalStore.update((s) => ({ ...s, SHOW_EVALUATE_HINT: true }));
    } else if ($skipTimeoutHint) {
      skipTimeoutHint.set(false);
    }
  };

  onMount(() => {
    if (!browser) return;
    intervalId = window.setInterval(check, 60_000);
  });

  onDestroy(() => {
    if (!browser) return;
    window.clearInterval(intervalId);
  });
</script>

{@render children()}
