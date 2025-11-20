<script lang="ts">
  import { init, use } from "echarts/core";
  import { BarChart } from "echarts/charts";
  import { Chart } from "svelte-echarts";
  import Container from "$lib/Statistics/Helper/Container.svelte";
  import { times_of_completion_sessions } from "$lib/Statistics/Logic/Overall";
  import { statistics } from "$lib/Statistics/Logic/Aggregate";
  import { GLOBALS } from "$lib/DANGER";
  import { isoToHourLocal } from "$lib/Statistics/Logic/HelpersCharts";
  import { downloadChart } from "$lib/Statistics/Logic/Export";

  use([BarChart]);

  /* ------------------------------------------------------------------------ */
  const times_of_completion_session = times_of_completion_sessions(
    $statistics.all.aggregated
  );
  $: hourBins = Array(24).fill(0);
  $: {
    hourBins.fill(0);
    for (const [ts, cnt] of Object.entries(times_of_completion_session ?? {})) {
      const h = isoToHourLocal(ts);
      hourBins[h] += Number(cnt) || 1;
    }
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  $: hourLabels = Array.from({ length: 24 }, (_, h) => `${pad(h)}:00`);
  $: hourCounts = hourBins.slice();
  $: maxCount_HOURS = Math.max(0, ...hourCounts);
  $: headroom_HOURS = Math.max(1, Math.ceil(maxCount_HOURS * 0.2));

  $: times_area_options = {
    tooltip: { trigger: "axis" },
    grid: { left: 40, right: 20, top: 30, bottom: 40 },
    xAxis: {
      type: "category",
      data: hourLabels,
      axisTick: { alignWithLabel: true },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: maxCount_HOURS + headroom_HOURS,
      minInterval: 1,
      name: "Evaluationen",
    },
    series: [
      {
        type: "line",
        data: hourCounts,
        smooth: true,
        areaStyle: {},
        symbol: "circle",
        symbolSize: 6,
        label: { show: true, position: "top" },
      },
    ],
    toolbox: downloadChart(),
  };
</script>

<Container
  title="Time of completion"
  description="At what time of day did participants complete the evaluation?"
>
  <Chart
    {init}
    options={times_area_options}
    style="width:100%; height:{$GLOBALS.chartheight}px"
  />
</Container>
