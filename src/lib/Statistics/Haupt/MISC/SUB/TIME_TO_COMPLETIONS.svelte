<script lang="ts">
  import { init, use } from "echarts/core";
  import { BarChart } from "echarts/charts";
  import { Chart } from "svelte-echarts";
  import Container from "$lib/Statistics/Helper/Container.svelte";
  import { times_to_completion_sessions } from "$lib/Statistics/Logic/Overall";
  import { statistics } from "$lib/Statistics/Logic/Aggregate";
  import { formatMsBins } from "$lib/Statistics/Logic/HelpersStatisitcs";
  import { GLOBALS } from "$lib/DANGER";
  import { downloadChart } from "$lib/Statistics/Logic/Export";

  use([BarChart]);

  const completion_times_session = times_to_completion_sessions(
    $statistics.all.aggregated
  );

  $: entries = Object.entries(completion_times_session || {})
    .map(([ms, c]) => [Number(ms), Number(c)] as const)
    .sort((a, b) => a[0] - b[0]);

  $: barData = entries.map(([ms, c]) => ({
    value: c,
    ms,
    label: formatMsBins(ms),
  }));

  $: times_to_completion_session_options = {
    grid: { left: 30, right: 96, top: 10, bottom: 20, containLabel: true },
    tooltip: {
      trigger: "item",
      formatter: (p: any) => `${formatMsBins(p.data.ms)}: ${p.value}`,
    },
    xAxis: {
      type: "value",
      minInterval: 1,
      name: "Evaluationen",
      nameLocation: "middle",
      nameGap: 30,
    },
    yAxis: {
      type: "category",
      data: barData.map((d) => d.ms),
      axisLabel: {
        formatter: (v: number) => formatMsBins(v),
      },
      name: "Duration",
    },
    series: [
      {
        type: "bar",
        data: barData.map((d) => d.value),
        label: { show: true, position: "right" },
        itemStyle: { borderRadius: [0, 6, 6, 0] },
        barMaxWidth: 48,
      },
    ],
    toolbox: downloadChart(),
  };
</script>

<Container
  title="Time to completion"
  description="How much time did people need to complete the evaluation?"
>
  <Chart
    {init}
    options={times_to_completion_session_options}
    style="width:100%; height:{$GLOBALS.chartheight}px"
  />
</Container>
