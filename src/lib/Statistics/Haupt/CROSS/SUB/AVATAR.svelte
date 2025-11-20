<script lang="ts">
  import { tests_avatar_stats } from "$lib/Statistics/Logic/HypothesisTests";
  import { onMount } from "svelte";

  let VegaLite: any = null,
    mounted = false;
  onMount(async () => {
    ({ VegaLite } = await import("svelte-vega"));
    mounted = true;
  });

  const labelMap: Record<string, string> = {
    variant: "Interaktionsbewertung ",
    tlx: "Arbeitsbelastung (NASA-TLX)",
    taskCorrectness: "Aufgaben-Korrektheit",
    taskRating: "Antwortqualität (Aufgaben)",
    taskRatingFree: "Δ Freihe Unterhaltung",
    final: "Gesamteindruck",
    finalTrust: "Vertrauen",
    finalComfort: "Komfort",
    finalUnderstanding: "Verständnis",
  };
  const nice = (k: string) => labelMap[k] ?? k;

  $: orderResult = $tests_avatar_stats;
  $: rows = Object.entries(orderResult ?? [])
    .map(([metric, v]: any) => ({
      metric,
      label: nice(metric),
      diff: v?.diff,
      lo: v?.ci95?.[0],
      hi: v?.ci95?.[1],
      mean_AB: v?.mean_AB,
      mean_BA: v?.mean_BA,
      p: v?.p,
      sig: v?.significance,
    }))
    .filter(
      (r) =>
        Number.isFinite(r.diff) &&
        Number.isFinite(r.lo) &&
        Number.isFinite(r.hi)
    );

  $: rows.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
  $: colorExpr = `datum.sig === "*" || datum.sig === "**" || datum.sig === "***" ? "crimson" : "gray"`;
  $: yOrder = rows.map((r) => r.label);

  $: spec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    data: { values: rows },
    width: 680,
    height: { step: 34 },

    layer: [
      {
        mark: { type: "rule", strokeDash: [3, 3] },
        encoding: { x: { datum: 0 } },
      },
      {
        mark: { type: "rule", strokeWidth: 3 },
        encoding: {
          y: { field: "label", type: "nominal", sort: yOrder },
          x: { field: "lo", type: "quantitative" },
          x2: { field: "hi" },
          color: { value: "lightgray" },
        },
      },
      {
        mark: { type: "point", filled: true, size: 80 },
        encoding: {
          y: { field: "label", type: "nominal" },
          x: {
            field: "diff",
            type: "quantitative",
            title: "Avatar-Mitteldifferenz (David − Susanne)",
          },
          color: {
            condition: { test: colorExpr, value: "crimson" },
            value: "gray",
          },
          tooltip: [
            { field: "label", title: "Metrik" },
            {
              field: "diff",
              title: "Differenz (David − Susanne)",
              format: ".2f",
            },
            { field: "lo", title: "95%-KI unten", format: ".2f" },
            { field: "hi", title: "95%-KI oben", format: ".2f" },
            { field: "mean_AB", title: "Mittelwert David", format: ".2f" },
            { field: "mean_BA", title: "Mittelwert Susanne", format: ".2f" },
            { field: "p", title: "p-Wert", format: ".3f" },
            { field: "sig", title: "Signifikanz" },
          ],
        },
      },
    ],
    config: {
      view: { stroke: null },
      axis: { title: null, labelFontSize: 11 },
    },
  };
</script>

{#if mounted}
  <!--  Haupterkensitsse: 1. wenn zuerst avatar, dann präferenz mittelwert bei -0.78,
  wenn zuerst text dann + 0.88 (also klar text) wenn zuerst text, dann präferenz
  mittelwert bei 0.78 -->

  <svelte:component this={VegaLite} {spec} />
{:else}
  <p style="font-family:monospace;opacity:.7">loading…</p>
{/if}
