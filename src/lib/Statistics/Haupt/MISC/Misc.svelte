<script lang="ts">
  import malePNG from "$lib/images/avatar/male.png?url";
  import femalePNG from "$lib/images/avatar/female.png?url";

  import { Chart } from "svelte-echarts";
  import { init, use } from "echarts/core";
  import { BarChart, LineChart, ScatterChart } from "echarts/charts";
  import {
    GridComponent,
    LegendComponent,
    TooltipComponent,
    MarkPointComponent,
  } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";
  import { statistics } from "$lib/Statistics/Logic/Aggregate";
  import ChartGrid from "../../Helper/ChartGrid.svelte";
  import Container from "../../Helper/Container.svelte";
  import { PLATFORM_ICONS } from "../../Logic/Misc";
  import TIME_TO_COMPLETIONS from "./SUB/TIME_TO_COMPLETIONS.svelte";
  import TimeOfCompletions from "./SUB/TIME_OF_COMPLETIONS.svelte";
  import WhichBackground from "./SUB/WhichBackground.svelte";
  import Order from "./SUB/Order.svelte";
  import { downloadChart } from "$lib/Statistics/Logic/Export";

  use([
    BarChart,
    GridComponent,
    LegendComponent,
    TooltipComponent,
    MarkPointComponent,
    CanvasRenderer,
    ScatterChart,
    LineChart,
  ]);

  $: rows = $statistics?.all?.raw || [];
  const meta = (r) => r?.session?.meta || r?.meta || {};

  /* ------------------------------------------------------------------------ */

  $: maleCount = rows.reduce(
    (n, r) => n + (meta(r).avatar_gender === "male" ? 1 : 0),
    0
  );
  $: femaleCount = rows.reduce(
    (n, r) => n + (meta(r).avatar_gender === "female" ? 1 : 0),
    0
  );
  $: maxCount = Math.max(maleCount, femaleCount, 0);
  const headroom = 4;
  const iconBump = 3.2;

  $: avatarOptions = {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: 40, right: 20, top: 30, bottom: 40 },
    xAxis: {
      type: "category",
      data: ["David", "Susanne"],
      axisTick: { alignWithLabel: true },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: maxCount + headroom,
      interval: 2,
      name: "Sessions",
    },
    series: [
      {
        type: "bar",
        data: [maleCount, femaleCount],
        barMaxWidth: 86,
        itemStyle: { borderRadius: [4, 4, 0, 0] },
        label: { show: true, position: "top" },
        markPoint: {
          symbolKeepAspect: true,
          symbolSize: [90, 90],
          data: [
            {
              coord: ["David", maleCount + iconBump],
              symbol: `image://${malePNG}`,
            },
            {
              coord: ["Susanne", femaleCount + iconBump],
              symbol: `image://${femalePNG}`,
            },
          ],
        },
      },
    ],
    toolbox: downloadChart(),
  };
  /*  */

  /* ------------------------------------------------------------------------ */

  $: platformCategoriesUTM = Object.values(PLATFORM_ICONS).map((p) => p.name);
  $: platformCounts = Object.values(PLATFORM_ICONS).map((p) => p.cnt ?? 0);
  $: maxCountUTM = Math.max(0, ...platformCounts);
  $: headroomUTM = Math.max(1, Math.ceil(maxCountUTM * 0.2));
  $: iconBumpUTM = 0.2;
  $: markPoints = Object.values(PLATFORM_ICONS).map((p) => ({
    coord: [p.name, (p.cnt ?? 0) + iconBumpUTM],
    symbol: `image://${p.src}`,
  }));

  $: utm_options = {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: 40, right: 20, top: 30, bottom: 40 },
    xAxis: {
      nameGap: 30,
      name: "Source",
      type: "category",
      data: platformCategoriesUTM,
      axisTick: { alignWithLabel: true },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: maxCountUTM + headroomUTM,
      minInterval: 1,
    },
    series: [
      {
        type: "bar",
        data: platformCounts,
        barMaxWidth: 36,
        itemStyle: { borderRadius: [4, 4, 0, 0] },
        label: { show: true, position: "top" },
        markPoint: {
          symbolKeepAspect: true,
          symbolSize: [36, 36],
          data: markPoints,
        },
      },
    ],
  };
</script>

<ChartGrid>
  <Container title="Avatars chosen" description="">
    <Chart {init} options={avatarOptions} style="width:100%;height:290px" />
  </Container>

  <!--   <WhichBackground /> -->
  <!--   <Container
    title="Platform Referrer"
    description="From what Platform did people come here?"
  >
    <Chart {init} options={utm_options} style="width:100%;height:290px" />
  </Container> -->

  <TIME_TO_COMPLETIONS />
  <TimeOfCompletions />
</ChartGrid>
