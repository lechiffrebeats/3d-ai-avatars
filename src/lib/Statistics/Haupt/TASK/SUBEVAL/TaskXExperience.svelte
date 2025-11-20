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
  use([
    ScatterChart,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    CanvasRenderer,
    BarChart,
    GraphicComponent,
  ]);

  const demo_ai_arr =
    $statistics.demographie?.aggregated?.demo_ai_experience?.values;

  const getDomFamiliarity = (id) => {
    const el =
      demo_ai_arr.find((e) => Object.keys(e.by_session).includes(id)) || {};
    return el ? el.x : 0; /* DARF ICH DAS EIG */
  };

  const taskcorrectness_uno = Object.values($statistics.tasks.ab_metrics)
    .map((e) => e.taskCorrectness?.values_x_session_id)
    .flat()
    .reduce((acc, e) => {
      const sid = e.session_id;
      const isCorrect = e.answer === "CORRECT" ? 1 : 0;
      if (!acc[sid])
        acc[sid] = { numCorrect: 0, domFamiliarity: getDomFamiliarity(sid) };
      acc[sid].numCorrect += isCorrect;
      return acc;
    }, {});

  $: scatterData = Object.entries(taskcorrectness_uno).map(([sid, d]: any) => [
    d.domFamiliarity ?? 0,
    d.numCorrect ?? 0,
    sid,
  ]);

  function groupByFamiliarity(data) {
    const groups = {};
    data.forEach(([fam, correct]) => {
      if (fam == null) return;
      if (!groups[fam]) groups[fam] = [];
      groups[fam].push(correct);
    });
    return groups;
  }

  $: grouped = groupByFamiliarity(scatterData);
  $: lineData = Object.entries(grouped)
    .map(([fam, arr]) => {
      const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
      return [Number(fam), avg];
    })
    .sort((a, b) => b[1] - a[1]);

  $: lineOptions = {
    grid: { left: 50, right: 50, top: 40, bottom: 30, containLabel: true },
    tooltip: {
      trigger: "axis",
    },
    xAxis: {
      name: "Ai Experience",
      type: "category",
      data: lineData.map((d) => d[0]),
      min: 0,
      max: 7,
      nameLocation: "middle",
      nameGap: 30,
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
  title="Task Correctness x Ai Experience"
  description="Sample Size: {scatterData.length}, averages, darker color = more evaluations here"
>
  <Chart {init} options={lineOptions} style="width:100%;height:290px" />
</Container>
