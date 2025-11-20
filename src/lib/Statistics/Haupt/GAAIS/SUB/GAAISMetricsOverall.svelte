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
  import { _ } from "@rgglez/svelte-i18n";
  import { calc_gaais_totals } from "../Calc";
  import { statistics } from "$lib/Statistics/Logic/Aggregate";

  echarts.use([
    BarChart,
    GridComponent,
    LegendComponent,
    TooltipComponent,
    CanvasRenderer,
  ]);

  /* 
    https://www.sciencedirect.com/science/article/pii/S2451958820300142
  Technology Readiness Index
  
    General Attitudes towards AI		
    Positive General Attitudes towards AI	3.60	0.67
    Negative General Attitudes towards AI	2.93	0.75
    Technology Readiness Index		
    Innovativeness	3.66	1.00
    Optimism	4.07	0.79
    Discomfort	3.02	0.91
    Insecurity	3.12	0.86 
  */

  let entries: any[] = [];

  $: if ($statistics?.gaais) {
    entries = calc_gaais_totals();
  }
  $: entries = entries.filter((e) => e.mean);

  $: rows = entries.map((e) =>
    e.mean
      ? {
          key: e.label,
          actualValues: [
            e.label,
            e.mean.toFixed(1),
            e.median.toFixed(1),
            e.min.toFixed(1),
            e.max.toFixed(1),
            e.sd.toFixed(1),
            `${e.percent.toFixed(1)} %`,
            e.iqr ? e.iqr.toFixed(1) : "-",
            e.note,
          ],
        }
      : []
  );
</script>

<Container
  title="Key Metrics overall"
  description="Metrics (Likert 1-5) | Negative Values were reverse-scored (6 - negativeValue) before calculating metrics"
>
  <TableMultipleColums
    cols={["label", "mean", "median", "min", "max", "sd", "%", "iqr", "note"]}
    {rows}
  />
</Container>

<!--rows =  [{ key: "GAAIS P01", values: [3.9,4,1,5,0.8] }, ...] -->
