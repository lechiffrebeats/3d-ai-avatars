<script>
  import { onMount } from "svelte";
  import * as echarts from "echarts/core";
  import { BarChart } from "echarts/charts";
  import {
    GridComponent,
    LegendComponent,
    TooltipComponent,
  } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";
  import Container from "$lib/Statistics/Helper/Container.svelte";
  import { _ } from "@rgglez/svelte-i18n";
  import { downloadChart } from "$lib/Statistics/Logic/Export";

  echarts.use([
    BarChart,
    GridComponent,
    LegendComponent,
    TooltipComponent,
    CanvasRenderer,
  ]);

  let el, chart;
  export let entries = [];
  export let title = "";
  export let description = "";
  export let barHeight = 300;
  export let postive;
  const pct = (v) => {
    const n = v.length || 1;
    return [
      (v.filter((x) => x <= 2).length * 100) / n,
      (v.filter((x) => x === 3).length * 100) / n,
      (v.filter((x) => x >= 4).length * 100) / n,
    ];
  };

  const addPercent = (x) => `${x.toFixed(1)}%`;

  const opts = () => {
    const labels = entries.map(
      (e) => `(${postive ? "p" : "n"}) ${$_(e.labelKey)}`
    );
    const bins = entries.map((e) =>
      pct(e.values || []).map((x) => Math.round(x))
    );
    const [dis, neu, agr] = [0, 1, 2].map((i) => bins.map((b) => b[i]));

    return {
      grid: { left: 70, right: 30, top: 30, bottom: 10, containLabel: true },
      legend: { top: 0 },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        valueFormatter: (v) => `${v}%`,
      },
      xAxis: {
        type: "value",
        max: 100,
        axisLabel: { formatter: (p) => addPercent(p) },
      },
      yAxis: { type: "category", data: labels },
      color: ["#f4a382", "#d9d9d9", "#9bd39b"],
      toolbox: downloadChart(),
      series: [
        {
          name: "Stimme dagegen (1,2)",
          type: "bar",
          stack: "t",
          data: dis,
          label: {
            show: true,
            position: "insideLeft",
            formatter: (p) => p.value || "",
          },
        },
        {
          name: "Neutral (3)",
          type: "bar",
          stack: "t",
          data: neu,
          label: {
            show: true,
            position: "inside",
            formatter: (p) => p.value || "",
          },
        },
        {
          name: "Stimme zu (4,5)",
          type: "bar",
          stack: "t",
          data: agr,
          label: {
            show: true,
            position: "insideRight",
            formatter: (p) => p.value || "",
          },
        },
      ],
    };
  };

  onMount(() => {
    chart = echarts.init(el);
    chart.setOption(opts());
    const r = () => chart.resize();
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  });
</script>

<Container {title} {description}>
  <div bind:this={el} style="width:100%;height:{barHeight}px;"></div>
</Container>
