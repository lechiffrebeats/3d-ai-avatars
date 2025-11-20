<script lang="ts">
  import { init, use } from "echarts";
  import { Chart } from "svelte-echarts";
  import { BarChart } from "echarts/charts";
  import Container from "./Container.svelte";

  export let METRICS = [];
  export let options = { backgroundcolor: "#3b3b3b", color: "gray" };
  export let keyData: Record<string, any> = {};
  export let title = "Key Data";
  export let description = "Important Metrics for this data";

  use([BarChart]);

  const label = (k: string) => k[0].toUpperCase() + k.slice(1);

  $: rows = METRICS.map((k) => ({
    name: label(k),
    key: k,
    ...keyData?.[k],
  })); /* .filter((r) => (r?.answers?.length ?? 0) > 0); */

  $: yLabels = rows.map((r) => r.name);
  $: means = rows.map((r) => Number(r.mean ?? 0));
  $: medPts = rows.map((r) => ({
    coord: [Number(r.median ?? r.mean ?? 0), r.name],
  }));
  $: tooltipData = Object.fromEntries(rows.map((r) => [r.name, r]));

  $: chart_options = {
    grid: { left: 10, right: 90, top: 16, bottom: 30, containLabel: true },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (items: any[]) => {
        const name = items?.[0]?.axisValue;
        const r = tooltipData[name] || {};
        const mean = r?.mean?.toFixed?.(2) ?? "—";
        const sd = r?.sd?.toFixed?.(2) ?? "—";
        const median = r?.median ?? "—";
        const iqr = r?.iqr ?? "—";
        const n = r?.answers?.length ?? 0;
        return `<b>${name}</b><br/>Mean: ${mean}<br/>Median: ${median}<br/>SD: ${sd} <br/>IQR: ${iqr}`;
      },
    },
    xAxis: {
      type: "value",
      min: 1,
      max: 7,
      name: "Likert (1–7)",
      nameLocation: "middle",
      nameGap: 30,
      axisTick: { alignWithLabel: true },
      splitLine: { show: false },
    },
    yAxis: {
      type: "category",
      data: yLabels,
      axisTick: { alignWithLabel: true },
    },
    series: [
      {
        type: "bar",
        data: means,
        barMaxWidth: 28,
        itemStyle: { borderRadius: [0, 6, 6, 0] },
        label: {
          show: true,
          position: "right",
          formatter: ({ value }: any) =>
            (value ?? "").toFixed ? value.toFixed(2) : value,
        },
      },
    ],
  };
</script>

<Container {options} {title} {description}>
  <Chart {init} options={chart_options} style="width:100%;height:280px" />
</Container>
