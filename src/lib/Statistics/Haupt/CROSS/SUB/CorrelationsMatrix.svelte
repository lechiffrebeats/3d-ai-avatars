<script lang="ts">
  import { onMount } from "svelte";
  import { tests_cross_store } from "$lib/Statistics/Logic/HypothesisTests";
  import { sampleCorrelation, sampleRankCorrelation } from "simple-statistics";

  let VegaLite: any = null,
    mounted = false;
  onMount(async () => {
    ({ VegaLite } = await import("svelte-vega"));
    mounted = true;
  });

  const fin = (x: any) => Number.isFinite(Number(x));
  let minN = 3;
  let minAbsR = 0;

  /* linearer Zusammenhänge zwischen zwei metrischen Variablen */
  const labelMap: Record<string, string> = {
    variant_composite: "Δ Interaktionsbewertung",
    tlx_composite: "Δ Arbeitsbelastung (NASA-TLX)",
    taskCorrectness_composite: "Δ Aufgaben-Korrektheit",
    taskRating_composite: "Δ Antwortqualität (Aufgaben)",
    taskRatingFree_composite: "Δ Freihe Unterhaltung",
    finalTrust_composite: "Δ Vertrauen (gesamt)",
    finalComfort_composite: "Δ Komfort",
    finalUnderstanding_composite: "Δ Verständnis",
    gaais_composite: "Alle GAAIS (neg reversed)",
    gaai_pos_composite: "Positive GAAIS",
    gaai_neg_composite: "Negative GAAIS (reversed)",
    aiExp_composite: "Erfahrung mit KI",
    fam_composite: "Kenntnisse Studiengang",
  };
  const nice = (k: string) =>
    labelMap[k] ??
    k
      .replace(/_composite$/, "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (m) => m.toUpperCase());

  $: cross = $tests_cross_store || {};
  $: vars = cross.vars || [];
  $: table = cross.table || {};
  $: labOrder = vars.map((v) => nice(v));

  $: corrRows = (() => {
    const out: any[] = [];
    for (let i = 0; i < vars.length; i++) {
      for (let j = 0; j < vars.length; j++) {
        const a = vars[i],
          b = vars[j];
        const colA = (table[a] ?? []) as (number | null)[];
        const colB = (table[b] ?? []) as (number | null)[];
        const x: number[] = [],
          y: number[] = [];
        const N = Math.max(colA.length, colB.length);
        for (let k = 0; k < N; k++) {
          const va = colA[k],
            vb = colB[k];
          if (fin(va) && fin(vb)) {
            x.push(+va!);
            y.push(+vb!);
          }
        }
        const n = x.length;
        let r = NaN,
          method = "pearson";
        if (i === j) {
          r = 1;
          method = "diag";
        } else if (n >= 3) {
          try {
            r = sampleCorrelation(x, y);
            method = "pearson";
          } catch {}
          if (!Number.isFinite(r)) {
            try {
              r = sampleRankCorrelation(x, y);
              method = "spearman";
            } catch {}
          }
        }
        const absr = Math.abs(r);
        const keep =
          i >= j &&
          (i === j || (n >= minN && Number.isFinite(r) && absr >= minAbsR));
        if (keep)
          out.push({
            xVar: a,
            yVar: b,
            xLab: nice(a),
            yLab: nice(b),
            ix: i,
            jy: j,
            r,
            absr,
            n,
            method,
          });
      }
    }
    return out;
  })();

  $: spec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    data: { values: corrRows },
    width: { step: 37 },
    height: { step: 37 },
    layer: [
      {
        mark: { type: "rect" },
        encoding: {
          x: {
            field: "xLab",
            type: "nominal",
            sort: labOrder,
            axis: { labelAngle: -45 },
          },
          y: { field: "yLab", type: "nominal", sort: labOrder },
          color: {
            field: "absr",
            type: "quantitative",
            scale: { domain: [0, 1], scheme: "blues" },
            legend: { title: "|r|", orient: "right" },
          },
        },
      },
      {
        mark: {
          type: "rect",
          stroke: "red",
          strokeWidth: 2,
        },
        transform: [
          {
            filter:
              "datum.absr > 0.5 && datum.absr < 1 && datum.ix !== datum.jy",
          },
        ],
        encoding: {
          x: { field: "xLab", type: "nominal", sort: labOrder },
          y: { field: "yLab", type: "nominal", sort: labOrder },
        },
      },
      {
        mark: { type: "text", baseline: "middle", fontSize: 11 },
        encoding: {
          x: { field: "xLab", type: "nominal", sort: labOrder },
          y: { field: "yLab", type: "nominal", sort: labOrder },
          text: { field: "r", type: "quantitative", format: ".2f" },
          color: {
            condition: { test: "datum.absr > 0.6", value: "white" },
            value: "black",
          },
          tooltip: [
            { field: "yLab", title: "Y-Variable" },
            { field: "xLab", title: "X-Variable" },
            { field: "r", title: "Korrelation r", format: ".3f" },
            { field: "n", title: "Stichprobe n" },
            { field: "method", title: "Methode" },
          ],
        },
      },
    ],
    config: {
      view: { stroke: null },
      axis: { labelFontSize: 11, title: null },
    },
  };
</script>

<div style="display:flex;gap:.5rem;align-items:center;margin-bottom:.5rem">
  <label
    >minN <input
      type="number"
      min="1"
      bind:value={minN}
      style="width:80px;margin-left:.25rem"
    /></label
  >
  <label
    >min|r| <input
      type="number"
      min="0"
      max="1"
      step="0.01"
      bind:value={minAbsR}
      style="width:80px;margin-left:.25rem"
    /></label
  >
</div>

{#if mounted}
  <svelte:component this={VegaLite} {spec} />
{:else}
  <p style="font-family:monospace;opacity:.7">loading…</p>
{/if}
