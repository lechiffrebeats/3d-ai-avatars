<script lang="ts">
  import { Chart } from "svelte-echarts";
  import { init, use } from "echarts/core";
  import { BarChart } from "echarts/charts";
  import {
    GridComponent,
    LegendComponent,
    TooltipComponent,
    GraphicComponent,
  } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";
  import Container from "$lib/Statistics/Helper/Container.svelte";
  import { AVATAR_COLOR } from "$lib/General";
  import { ScatterChart } from "echarts/charts";
  import { getTaskCorrectness } from "../../DEMO/Calc";
  import { graphic } from "echarts";
  import { downloadChart } from "$lib/Statistics/Logic/Export";
  use([
    ScatterChart,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    CanvasRenderer,
    BarChart,
    GraphicComponent,
  ]);

  const STATUS_LABELS: Record<string, string> = {
    bachelor: "Bachelor-Studierende",
    master: "Master-Studierende",
    doctoral: "Promovierende",
    alumni: "Alumni",
    external: "Extern",
    no_answer: "Keine Angabe",
    NONE: "Keine Angabe",
  };
  const prettyStatus = (raw: unknown) =>
    STATUS_LABELS[String(raw)] ?? String(raw);

  $: localTaskCorr = getTaskCorrectness();
  $: scatterData = Object.entries(localTaskCorr).map(([sid, d]: any) => [
    d.statusByUser ?? "NONE",
    d.numCorrect ?? 0,
    sid,
  ]);

  function groupByStatus(data: any[]) {
    const groups: Record<string, number> = {};
    data.forEach(([fam]) => {
      if (fam == null) return;
      groups[fam] = (groups[fam] ?? 0) + 1;
    });
    return groups;
  }

  $: grouped = groupByStatus(scatterData);
  $: lineData = Object.entries(grouped).sort(
    (a, b) => Number(b[1]) - Number(a[1])
  );

  $: lineOptions = {
    grid: { left: 50, right: 50, top: 40, bottom: 30, containLabel: true },
    tooltip: { trigger: "axis" },
    xAxis: {
      name: "Status an der Uni Bremen",
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
        rotate: 25,
        overflow: "break",
        margin: 10,
        lineHeight: 10,
        formatter: (val: string) => prettyStatus(val),
      },
      axisTick: { alignWithLabel: true },
    },
    yAxis: { name: "Anzahl", type: "value", min: 0, max: 6 },
    series: [
      {
        type: "bar",
        showSymbol: true,
        data: lineData.map((d) => d[1]),
        itemStyle: { color: AVATAR_COLOR },
        lineStyle: { width: 3 },
      },
    ],
    toolbox: downloadChart(),
  };
</script>

<Container title="Status an der Uni Bremen" description="">
  <Chart {init} options={lineOptions} style="width:100%;height:290px" />
</Container>
