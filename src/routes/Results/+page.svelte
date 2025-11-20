<script lang="ts">
  import { onMount } from "svelte";
  import { aggregate, statistics } from "$lib/Statistics/Logic/Aggregate";
  import Demographie from "$lib/Statistics/Haupt/DEMO/Demographie.svelte";
  import Abschlussfragen from "$lib/Statistics/Haupt/FINAL/Abschlussfragen.svelte";
  import Aufgaben from "$lib/Statistics/Haupt/TASK/Tasks.svelte";
  import Misc from "$lib/Statistics/Haupt/MISC/Misc.svelte";
  import Tlx from "$lib/Statistics/Haupt/NASA/NASA_TLX.svelte";
  import Container from "$lib/Statistics/Helper/Container.svelte";
  import constructing from "$lib/images/Misc/constructing.gif";
  import { page } from "$app/state";
  import VarianteRating from "$lib/Statistics/Haupt/VARIANTE/VarianteRating.svelte";
  import ChartGrid from "$lib/Statistics/Helper/ChartGrid.svelte";
  import GAAIS from "$lib/Statistics/Haupt/GAAIS/GAAIS.svelte";
  import Overall from "$lib/Statistics/Haupt/Overall.svelte";
  import { statsCalculated } from "$lib/Statistics/Logic/Misc";
  import Cross from "$lib/Statistics/Haupt/CROSS/Cross.svelte";

  /* https://awesome.cube.dev/tools/echarts/svelte */
  /* https://github.com/bherbruck/svelte-echarts */

  export let data: { evaluations: any[] };
  let loading = true;

  onMount(async () => {
    aggregate(data.evaluations);
    console.log("statsCalculated", $statistics);
    setTimeout(
      () => {
        loading = false;
      },
      page.url.hostname === "localhost" ? 0 : 1800
    );
  });
</script>

<svelte:head>
  <title>Study Results (Ongoing)</title>
  <meta name="description" content="Evaluation Analysis" />
</svelte:head>

<section class="wrap">
  {#if loading}
    <div class="loading-gif-container">
      <img src={constructing} class="loading-gif" alt="" />
      <h2>Constructing Statistics…</h2>
    </div>
  {:else if $statistics && $statistics.all.aggregated.length > 0}
    <h1 style="margin:0;">Evaluation Results</h1>

    <ChartGrid>
      <Container
        title="⚠️Note"
        description="Last Update: {new Date()}"
        options={{ backgroundcolor: "#3b3b3b", color: "gray" }}
      >
        <small style="margin:0; font-size:0.8rem;">
          <ul style="margin:0; padding-left:1.2rem;">
            <li>
              This statistics page is a work in progress. It shows all
              evaluations (anonymized & merged) completed by participants
              (including yours). More stats will be added.
            </li>
            <li>
              If you intend to do the evaluation, please do not view the results
              first.
            </li>
            <li>
              Your messages will <b>never</b> be public at any point (only aggregate
              data such as counts, durations, etc.).
            </li>
          </ul>
        </small>
      </Container>

      <div class="highlight">
        <Container
          title="SurveyCircle.com"
          description="Reedem your Survey Code"
          options={{ backgroundcolor: "#3b3b3b", color: "gray" }}
        >
          <!-- {#if step?.stable_key === "final-questionnaire-v1"} -->
          <div class="final-questionnaire">
            <p>
              Survey Code mit einem Klick einlösen:
              <a
                target="_blank"
                rel="noopener noreferrer"
                style="color: darkorange;"
                href="https://www.surveycircle.com/C1S2-HEYJ-PVM1-W4R9/"
              >
                https://www.surveycircle.com/C1S2-HEYJ-PVM1-W4R9/
              </a>
            </p>

            <div
              class="survey"
              style="display: flex; align-items: center; gap: 0.5rem;"
            >
              <code style="color: black;" id="survey-code"
                >C1S2-HEYJ-PVM1-W4R9</code
              >
              <button
                on:click={() =>
                  navigator.clipboard.writeText(
                    document.getElementById("survey-code").textContent
                  )}
              >
                Copy
              </button>
            </div>
          </div>
        </Container>
      </div>
    </ChartGrid>
    <Overall />

    <h1>Hypothesis Scatter Alle</h1>
    <Cross />
    <Misc />

    <h1>Demographics</h1>
    <Demographie />

    <h1>The General Attitudes towards Artificial Intelligence Scale (GAAIS)</h1>
    <GAAIS />

    <h1>Tasks (Avatar vs Text)</h1>
    <Aufgaben />

    <h1>NASA-TLX RAW (Avatar vs Text)</h1>
    <Tlx />

    <h1>Variant Rating (Avatar vs Text)</h1>
    <VarianteRating />

    <h1>Final Questionarie</h1>
    <Abschlussfragen />
  {/if}
</section>

<style>
  .highlight {
    box-shadow: 0 0 10px 10px #ffeac9;
    border-radius: 20px;
  }

  .survey {
    background-color: #bdbdbd;
    padding: 0.5rem;
    border-radius: 10px;
  }

  .final-questionnaire {
    display: flex;
    flex-direction: column;
  }

  .wrap {
    display: flex;
    flex-direction: column;
    color: #222;
    padding: 1rem;
    gap: 1rem;
    margin: 0 auto;
  }
  .loading-gif {
    margin: 0 auto;
    padding: 0;
    display: block;
  }

  h2 {
    text-align: center;
    font-weight: 600;
    font-size: 1.8rem;
    color: rgb(63, 63, 63);
    margin: 0;
    padding: 0;
  }

  .loading-gif-container {
    width: 350px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    gap: 1rem;
  }

  h1 {
    text-align: left;
    margin: 0;
    font-weight: 600;
    font-size: 1.6rem;
    color: rgb(63, 63, 63);
  }

  small {
    margin: 0;
    padding: 0;
    font-size: 0.8rem;
    color: rgb(63, 63, 63);
  }
</style>
