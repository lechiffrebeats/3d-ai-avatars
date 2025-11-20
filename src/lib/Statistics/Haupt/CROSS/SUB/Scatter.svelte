<script lang="ts">
  import { onMount } from "svelte";
  import {
    math_hypotheses_corr,
    tests_cross_store,
  } from "$lib/Statistics/Logic/HypothesisTests";

  let mounted = false;
  let VegaLite: any = null;

  onMount(async () => {
    ({ VegaLite } = await import("svelte-vega"));
    mounted = true;
  });

  const DOMAIN: [number, number] = [-5, 5];

  $: cross = $tests_cross_store || {};
  $: vars = cross.vars || [] /* .slice(0, 6) */;
  $: table = cross.table || {};

  function toRows(tbl: Record<string, any[]>, names: string[]) {
    const n = Math.max(...names.map((nm) => tbl[nm]?.length || 0));
    const out: any[] = [];
    for (let i = 0; i < n; i++) {
      const row: any = {};
      for (const nm of names) {
        const v = tbl[nm]?.[i];
        if (Number.isFinite(Number(v))) row[nm] = +v;
      }
      if (Object.keys(row).length) out.push(row);
    }
    return out;
  }
  $: rows = toRows(table, vars);

  $: spec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    data: { values: rows },
    repeat: { row: vars, column: vars },
    spec: {
      layer: [
        {
          mark: { type: "point", filled: true, size: 25, opacity: 0.8 },
          encoding: {
            x: {
              field: { repeat: "column" },
              type: "quantitative",
              scale: { domain: DOMAIN, nice: false, zero: false },
            },
            y: {
              field: { repeat: "row" },
              type: "quantitative",
              scale: { domain: DOMAIN, nice: false, zero: false },
            },
            tooltip: vars.map((v) => ({ field: v, type: "quantitative" })),
          },
        },
        {
          mark: { type: "rule", strokeWidth: 1, opacity: 0.4 },
          encoding: {
            x: { datum: 0 },
            y: { value: 0 },
            y2: { value: 1 },
          },
        },
        {
          mark: { type: "rule", strokeWidth: 1, opacity: 0.4 },
          encoding: {
            y: { datum: 0 },
            x: { value: 0 },
            x2: { value: 1 },
          },
        },
      ],
    },
    resolve: { scale: { x: "independent", y: "independent" } },
  };
</script>

{#if mounted}
  <!--  -->
  r∈[−1,+1]
  <svelte:component this={VegaLite} {spec} />
{:else}
  <p style="font-family:monospace;opacity:.7">loading…</p>
{/if}
