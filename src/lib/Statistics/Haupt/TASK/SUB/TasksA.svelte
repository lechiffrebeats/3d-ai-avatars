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
  import { kpiBox } from "$lib/Statistics/Logic/HelpersCharts";
  import { statistics } from "$lib/Statistics/Logic/Aggregate";
  import { STABLE_KEY_LABELS } from "$lib/Evaluation/Evaluation";
  import Container from "$lib/Statistics/Helper/Container.svelte";
  import { AVATAR_COLOR } from "$lib/General";

  use([
    BarChart,
    GridComponent,
    LegendComponent,
    TooltipComponent,
    CanvasRenderer,
    GraphicComponent,
  ]);

  $: rows_avatar = Object.entries($statistics?.tasks?.a_metrics || {});
  $: taskLabels = rows_avatar.map(([id]) => STABLE_KEY_LABELS[id]);

  $: pctCorrectNum = rows_avatar.map(([, v]) =>
    Number(v?.taskCorrectness?.percentageCorrect ?? 0)
  );
  $: pctCorrect = pctCorrectNum.map((v) => Number(v.toFixed(1)));

  $: kpi =
    pctCorrectNum && pctCorrectNum.length
      ? kpiBox(pctCorrectNum, { unit: "%", decimals: 1, corner: "tr" })
      : null;

  $: taskPerfOptions_Text = {
    grid: { left: 30, right: 20, top: 50, bottom: 6, containLabel: true },
    tooltip: {
      trigger: "item",
      formatter: ({ name, value }: any) =>
        `${name}: ${Number(value).toFixed(1)}%`,
    },
    xAxis: { type: "category", data: taskLabels, axisLabel: { rotate: 45 } },
    yAxis: {
      type: "value",
      min: 0,
      max: 100,
      axisLabel: { formatter: "{value}%" },
    },
    series: [
      {
        type: "bar",
        data: pctCorrect,
        barMaxWidth: 28,
        itemStyle: { color: AVATAR_COLOR, borderRadius: [4, 4, 0, 0] },
        label: {
          show: true,
          position: "top",
          formatter: ({ value }: any) => `${Number(value).toFixed(1)}%`,
        },
        emphasis: { itemStyle: { color: "#d97706" } },
      },
    ],
    /* graphic: kpi?.graphic ?? [], */
  };
</script>

<Container
  title="Tasks Avatar"
  description="poeple solving each task correctly with avatar-interface"
>
  <Chart
    {init}
    options={taskPerfOptions_Text}
    style="width:100%;height:290px"
  />
</Container>
