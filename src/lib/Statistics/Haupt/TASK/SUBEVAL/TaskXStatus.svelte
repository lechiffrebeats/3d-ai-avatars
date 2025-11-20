<script lang="ts">
  import { Chart } from "svelte-echarts";
  import { init, use } from "echarts/core";
  import { BarChart } from "echarts/charts";
  import {
    GraphicComponent,
    GridComponent,
    LegendComponent,
    TooltipComponent,
  } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";
  import { statistics } from "$lib/Statistics/Logic/Aggregate";
  import Container from "$lib/Statistics/Helper/Container.svelte";
  import { AVATAR_COLOR } from "$lib/General";

  import { ScatterChart } from "echarts/charts";
  import { getTaskCorrectness } from "../../DEMO/Calc";
  import { getSessionById } from "$lib/Statistics/Logic/HelpersStatisitcs";
  use([
    ScatterChart,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    CanvasRenderer,
    BarChart,
    GraphicComponent,
  ]);

  $: localTaskCorr = getTaskCorrectness();

  $: scatterData = Object.entries(localTaskCorr).map(([sid, d]: any) => [
    d.statusByUser ?? "NONE",
    d.numCorrect ?? 0,
    sid,
  ]);

  function groupByStatus(data) {
    const groups = {};
    data.forEach(([fam, correct, sid]) => {
      if (fam == null) return;
      if (!groups[fam]) groups[fam] = [];
      groups[fam].push(correct);
    });
    return groups;
  }

  $: grouped = groupByStatus(scatterData);

  $: lineData = Object.entries(grouped)
    .map(([fam, arr]) => {
      const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
      return [fam, avg];
    })
    .sort((a, b) => Number(b[1]) - Number(a[1]));

  $: lineOptions = {
    grid: { left: 50, right: 50, top: 40, bottom: 20, containLabel: true },
    tooltip: {
      trigger: "axis",
    },
    xAxis: {
      name: "Status Uni Bremen",
      type: "category",
      data: lineData.map((d) => d[0]),
      min: 0,
      max: 5,
      alignWithLabel: true,
      nameLocation: "middle",
      nameGap: 60,
      axisLabel: {
        interval: 0,
        width: 63,
        rotate: 45,
        overflow: "break",
        lineHeight: 10,
      },
      axisTick: { alignWithLabel: true },
    },
    yAxis: {
      name: "Avg Correct Answers",
      type: "value",
      min: 0,
      max: 6,
    },
    series: [
      {
        type: "bar",
        showSymbol: true,
        data: lineData.map((d) => d[1]),
        itemStyle: { color: AVATAR_COLOR },
        lineStyle: { width: 3 },
      },
    ],
  };
</script>

<Container
  title="Task Correctness x Status"
  description="Sample Size: {scatterData.length}, averages, darker color = more evaluations here"
>
  <Chart {init} options={lineOptions} style="width:100%;height:290px" />
</Container>
