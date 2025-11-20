<script lang="ts">
  import { Chart } from "svelte-echarts";
  import { init, use } from "echarts/core";
  import { BarChart } from "echarts/charts";
  import {
    GridComponent,
    LegendComponent,
    TooltipComponent,
  } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";
  import Container from "$lib/Statistics/Helper/Container.svelte";
  import { statistics } from "$lib/Statistics/Logic/Aggregate";

  use([
    BarChart,
    GridComponent,
    LegendComponent,
    TooltipComponent,
    CanvasRenderer,
  ]);

  const aTot = $statistics?.tasks?.a_metrics_total || {};
  const tTot = $statistics?.tasks?.b_metrics_total || {};

  function tripleFromTotals(tot: any) {
    const tc = tot?.taskCorrectnessAllThree || {};

    const total = Number(tc?.total ?? 0);
    const nC = Number(tc?.numberCorrect ?? 0);
    const nI = Number(tc?.numberIncorrect ?? 0);
    const nNR = Number(tc?.numberUnanswered ?? 0);
    if (!total) return [0, 0, 0];
    const pC = (nC / total) * 100;
    const pI = (nI / total) * 100;
    const pNR = (nNR / total) * 100;
    return [pC, pI, pNR].map((x) => Number(x.toFixed(1)));
  }

  const [A_C, A_I, A_NR] = tripleFromTotals(aTot);
  const [T_C, T_I, T_NR] = tripleFromTotals(tTot);

  const options = {
    grid: { left: 32, right: 20, top: 40, bottom: 20, containLabel: true },
    legend: { top: 6 },
    tooltip: {
      trigger: "item",
      formatter: ({ seriesName, name, value }: any) =>
        `${name} · ${seriesName}: ${Number(value).toFixed(1)}%`,
    },
    xAxis: { type: "category", data: ["Avatar", "Text"] },
    yAxis: {
      type: "value",
      min: 0,
      max: 100,
      axisLabel: { formatter: "{value}%" },
    },
    series: [
      {
        name: "Correct",
        type: "bar",
        stack: "stack",
        barMaxWidth: 40,
        data: [A_C, T_C],
        label: {
          show: true,
          position: "insideTop",
          formatter: ({ value }: any) =>
            value ? `${Number(value).toFixed(0)}%` : "",
        },
      },
      {
        name: "Incorrect",
        type: "bar",
        stack: "stack",
        barMaxWidth: 40,
        data: [A_I, T_I],
        label: {
          show: true,
          position: "inside",
          formatter: ({ value }: any) =>
            value ? `${Number(value).toFixed(0)}%` : "",
        },
      },
      {
        name: "No reply",
        type: "bar",
        stack: "stack",
        barMaxWidth: 40,
        data: [A_NR, T_NR],
        label: {
          show: true,
          position: "insideBottom",
          formatter: ({ value }: any) =>
            value ? `${Number(value).toFixed(0)}%` : "",
        },
      },
    ],
  };
</script>

<Container
  title="Overall Task Outcomes by Interface"
  description="Mean share across all tasks: Correct vs Incorrect vs No reply"
>
  <Chart {init} {options} style="width:100%;height:300px" />
</Container>
