<script lang="ts">
  import Container from "$lib/Statistics/Helper/Container.svelte";
  import { statistics } from "$lib/Statistics/Logic/Aggregate";
  import { Chart } from "svelte-echarts";
  import { init, use } from "echarts/core";
  import { BarChart } from "echarts/charts";
  import {
    GridComponent,
    LegendComponent,
    TooltipComponent,
  } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";
  import { AVATAR_COLOR, EQUAL_COLOR, TEXT_COLOR } from "$lib/General";
  import { _ } from "@rgglez/svelte-i18n";

  use([
    BarChart,
    GridComponent,
    LegendComponent,
    TooltipComponent,
    CanvasRenderer,
  ]);

  import { ToolboxComponent } from "echarts/components";
  import { downloadChart } from "$lib/Statistics/Logic/Export";
  use([ToolboxComponent]);

  const clamp = (x: number, min = 1, max = 7) =>
    Math.min(max, Math.max(min, x));

  $: rows = Object.values($statistics?.final?.aggregated ?? []).map(
    (ent: any) => {
      const lab = $_(ent.labelKey);
      const vals = (ent.list ?? [])
        .map((v: number) => clamp(Number(v)))
        .filter(Number.isFinite);
      const n = vals.length || 1;
      const c = Array(8).fill(0);
      for (const v of vals) c[v]++;

      const textPct = ((c[1] + c[2] + c[3]) / n) * 100;
      const equalPct = (c[4] / n) * 100;
      const avatarPct = ((c[5] + c[6] + c[7]) / n) * 100;

      return { label: lab, text: -textPct, equal: equalPct, avatar: avatarPct };
    }
  );

  $: option = {
    color: [TEXT_COLOR, EQUAL_COLOR, AVATAR_COLOR],
    legend: { top: 0 },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      valueFormatter: (v: any) => `${Math.abs(v).toFixed(0)}%`,
    },
    grid: { left: 60, right: 40, top: 28, bottom: 40, containLabel: true },
    xAxis: { type: "value", min: -100, max: 100, splitNumber: 4 },
    yAxis: {
      type: "category",
      data: rows.map((r) => r.label),
      axisLabel: { interval: 0, width: 120, overflow: "break", lineHeight: 16 },
    },
    series: [
      {
        name: "Text (1–3)",
        type: "bar",
        stack: "x",
        data: rows.map((r) => r.text),
        barMaxWidth: 30,
      },
      {
        name: "Equal (4)",
        type: "bar",
        stack: "x",
        data: rows.map((r) => r.equal),
        barMaxWidth: 30,
      },
      {
        name: "Avatar (5–7)",
        type: "bar",
        stack: "x",
        data: rows.map((r) => r.avatar),
        barMaxWidth: 30,
      },
    ],
    toolbox: downloadChart(),
  };
</script>

<!-- <Export {option} /> -->
<Container
  title="Avatar vs Text (Diverging Likert)"
  description="1–3 → Text • 4 → Equal • 5–7 → Avatar (percentages per question)"
>
  <Chart {init} options={option} style="width:100%;height:320px" />
</Container>
