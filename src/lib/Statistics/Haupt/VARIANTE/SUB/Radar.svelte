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
  import { kpiBox } from "$lib/Statistics/Logic/HelpersCharts";

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

  const groupAvatar = $statistics.variantRating.avatar || [];
  const groupText = $statistics.variantRating.text || [];

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

  const wrapText = (s: string, limit = 12) =>
    String(s)
      .replace(new RegExp(`([^\\n]{1,${limit}})(\\s|$)`, "g"), "$1\n")
      .trim();

  $: options = {
    legend: {
      data: ["Avatar-Interface", "Text-Interface"],
      top: 0,
    },
    color: [AVATAR_COLOR, "#37a1d9"],
    radar: {
      center: ["50%", "58%"],
      radius: "48%",
      name: {
        formatter: (n: string) => wrapText(n, 24),
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
  title="Tasks Avatar"
  description="How did people feel about the interfaces appearance and interaction? (Likert 1–7)"
>
  <Chart {init} {options} style="width:100%;height:290px" />
</Container>
