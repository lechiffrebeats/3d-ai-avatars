<script>
  import { _ } from "@rgglez/svelte-i18n";
  import { generalStore } from "../generalStore";
  import evaluate from "$lib/images/evaluate.svg";
  import { page } from "$app/state";
  import evalhint from "$lib/images/eval/orange.gif";
  import { skipTimeoutHint } from "../../General";
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
{#if page.url.pathname.startsWith("/evaluation")}
  <div
    class="brand"
    style="display: flex;"
    aria-label={$_("header.evaluate.aria", {
      values: {
        action: $generalStore.SHOW_EVALUATE
          ? $_("header.evaluate.minimize")
          : $_("header.evaluate.open"),
      },
    })}
  >
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore event_directive_deprecated -->
    <div
      class="evaluatebox"
      style="position: relative;"
      aria-label={$_("header.evaluate.aria", {
        values: {
          action: $generalStore.SHOW_EVALUATE
            ? $_("header.evaluate.minimize")
            : $_("header.evaluate.open"),
        },
      })}
      on:click={() => {
        generalStore.update((s) => ({
          ...s,
          SHOW_EVALUATE: !s.SHOW_EVALUATE,
          SHOW_EVALUATE_HINT: false,
        }));
        skipTimeoutHint.set(true);
      }}
    >
      <p style="margin: 0; padding: 0;">
        {$generalStore.SHOW_EVALUATE
          ? $_("header.evaluate.minimize")
          : $_("header.evaluate.open")}
      </p>
      <img
        src={evaluate}
        alt="Evaluation"
        class="logo evaluate"
        style="filter:invert(1); cursor: pointer; margin: 0; padding: 0;"
      />
    </div>
  </div>
{/if}

{#if $generalStore.SHOW_EVALUATE_HINT}
  <img
    src={evalhint}
    alt=""
    draggable="false"
    loading="lazy"
    width="55"
    height="55"
    class="evalhint"
  />
{/if}

<style>
  .evaluate {
    margin: 0;
  }

  .evalhint {
    position: fixed;
    z-index: 10000;
    margin-top: 5rem;
  }

  .evaluatebox {
    border: rgb(242, 242, 242) 1px solid;
    background: rgb(244, 89, 0);
    border-radius: 12px;
    padding: 0 0.8rem;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    cursor: pointer;
  }
  .evaluatebox:hover {
    transform: scale(1.04);
    transition: transform 0.2s ease-in-out;
  }
  .evaluatebox p {
    margin: 0;
    color: white;
    font-weight: 600;
  }

  .brand {
    display: flex;
    align-items: center;
    margin: 0;
    height: fit-content;
  }
  .logo {
    margin: 0;
    padding: 0;
    height: 17px;

    filter: invert(1);
    width: auto;
  }
</style>
