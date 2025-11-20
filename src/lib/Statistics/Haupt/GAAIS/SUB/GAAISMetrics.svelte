<!-- Factor loadings from the Exploratory Factor Analysis of General Attitudes towards Artificial Intelligence data. -->
<script lang="ts">
  import * as echarts from "echarts/core";
  import { BarChart } from "echarts/charts";
  import {
    GridComponent,
    LegendComponent,
    TooltipComponent,
  } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";
  import Container from "$lib/Statistics/Helper/Container.svelte";
  import TableMultipleColums from "$lib/Statistics/Helper/TableMultipleColums.svelte";
  import { statistics } from "$lib/Statistics/Logic/Aggregate";
  import { _ } from "@rgglez/svelte-i18n";
  import { isPositiveGaaisLabel } from "../Calc";

  echarts.use([
    BarChart,
    GridComponent,
    LegendComponent,
    TooltipComponent,
    CanvasRenderer,
  ]);

  $: entries = Object.values($statistics.gaais.aggregated);
  $: rows = entries.map((e) => ({
    key: e.label,
    actualValues: [
      `(${isPositiveGaaisLabel(e.id) ? "p" : "n"}) ${$_(e.labelKey)}`,
      e.mean.toFixed(1),
      e.median.toFixed(1),
      e.min.toFixed(1),
      e.max.toFixed(1),
      e.percent ? `${e.percent.toFixed(1)}%` : "-",
      e.sd.toFixed(1),
      e.iqr ? e.iqr.toFixed(1) : "-",
    ],
  }));
</script>

<!-- 
<Container
  title="Key Metrics per question"
  description="Metrics (Likert 1-5) | Negative Values are NOT reverse-scored here (6 - negativeValue) before calculating metrics"
>
  <TableMultipleColums
    cols={["label", "mean", "median", "min", "max", "% Agree", "sd", "iqr"]}
    {rows}
  />
</Container>
 -->
