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

  echarts.use([
    BarChart,
    GridComponent,
    LegendComponent,
    TooltipComponent,
    CanvasRenderer,
  ]);

  $: entries = Object.values($statistics.tlx.aggregated) || [];
  $: entriesTotal = [
    { label: "Total", ...$statistics.tlx.total },
    { label: "Avatar", ...$statistics.tlx.totalAvatar },
    { label: "Text", ...$statistics.tlx.totalText },
  ];

  $: rowsTotal = entriesTotal.map((e) => ({
    key: "Total: ",
    actualValues: [
      e.labelKey ? `${$_(e.labelKey)}` : e.label,
      e.mean.toFixed(1),
      e.median.toFixed(1),
      e.min.toFixed(1),
      e.max.toFixed(1),
      e.percent ? `${e.percent?.toFixed(1)}%` : "-",
      e.sd.toFixed(1),
      e.iqr ? e.iqr.toFixed(1) : "-",
    ],
  }));

  $: rows = entries.map((e) => ({
    key: e.labelKey ? `${$_(e.labelKey)}` : e.label,
    actualValues: [
      e.labelKey ? `${$_(e.labelKey)}` : e.label,
      e.mean.toFixed(1),
      e.median.toFixed(1),
      e.min.toFixed(1),
      e.max.toFixed(1),
      e.percent ? `${e.percent?.toFixed(1)}%` : "-",
      e.sd.toFixed(1),
      e.iqr ? e.iqr.toFixed(1) : "-",
    ],
  }));
</script>

<Container title="Key Metrics Total" description="Meics">
  <TableMultipleColums
    cols={["label", "mean", "median", "min", "max", "% Agree", "sd", "iqr"]}
    rows={rowsTotal}
  />
</Container>

<Container title="Key Metrics" description="Metrtrics">
  <TableMultipleColums
    cols={["label", "mean", "median", "min", "max", "% Agree", "sd", "iqr"]}
    {rows}
  />
</Container>
