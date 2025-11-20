<script lang="ts">
  import { Chart } from "svelte-echarts";
  import { init, use } from "echarts/core";
  import { BarChart, RadarChart } from "echarts/charts";
  import {
    GraphicComponent,
    GridComponent,
    LegendComponent,
    TitleComponent,
    TooltipComponent,
  } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";
  import Container from "$lib/Statistics/Helper/Container.svelte";
  import { _ } from "@rgglez/svelte-i18n";
  import { AVATAR_COLOR } from "$lib/General";
  import { statistics } from "$lib/Statistics/Logic/Aggregate";
  import { kpiBox, wrapTextCharts } from "$lib/Statistics/Logic/HelpersCharts";

  use([
    BarChart,
    GridComponent,
    LegendComponent,
    TooltipComponent,
    CanvasRenderer,
    RadarChart,
    GraphicComponent,
    TitleComponent,
  ]);

  const groupAvatar = $statistics.tlx.avatar || [];
  const groupText = $statistics.tlx.text || [];

  const indicatorMap = groupAvatar.map((e) => ({
    name: $_(e.labelKey) /* .slice(10) */,
    max: 7,
  }));

  $: dataSeries = {
    name: "Avatar vs Text",
    type: "radar",
    data: [
      {
        value: groupAvatar.map((e) => e.median),
        name: "Avatar-Interface",
      },
      {
        value: groupText.map((e) => e.median),
        name: "Text-Interface",
      },
    ],
  };

  $: kpi = kpiBox(
    groupAvatar.map((e) => e.median),
    { unit: "/7", decimals: 1, corner: "tr" }
  );

  $: options = {
    legend: {
      data: ["Avatar-Interface", "Text-Interface"],
      top: 0,
    },
    color: [AVATAR_COLOR, "#37a1d9"],
    radar: {
      center: ["50%", "58%"],
      radius: "52%",
      name: {
        formatter: (n: string) => wrapTextCharts(n, 24),
        textStyle: {
          width: 90,
          overflow: "break",
          lineHeight: 16,
        },
      },
      indicator: indicatorMap,
    },
    series: [dataSeries],
    graphic: kpi?.graphic ?? [],
  };
</script>

<Container
  title="NASA-TLX (A vs B)"
  description="How do people rate the workload of the tasks? (Likert 1–7)| NOT reverse-scored"
>
  <Chart {init} {options} style="width:100%;height:290px" />
</Container>
