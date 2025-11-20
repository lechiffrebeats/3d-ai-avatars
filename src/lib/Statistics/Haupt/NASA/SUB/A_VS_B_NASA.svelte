<script lang="ts">
  import Container from "$lib/Statistics/Helper/Container.svelte";
  import { statistics } from "$lib/Statistics/Logic/Aggregate";
  import { Chart } from "svelte-echarts";
  import { init, use } from "echarts/core";
  import { BoxplotChart } from "echarts/charts";
  import {
    GridComponent,
    DatasetComponent,
    LegendComponent,
    TooltipComponent,
  } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";
  import { AVATAR_COLOR, TEXT_COLOR } from "$lib/General";
  import { _ } from "@rgglez/svelte-i18n";
  import { downloadChart } from "$lib/Statistics/Logic/Export";
  import { hex8toHex, hex8toRGBA } from "$lib/Statistics/Logic/Misc";

  use([
    BoxplotChart,
    GridComponent,
    DatasetComponent,
    LegendComponent,
    TooltipComponent,
    CanvasRenderer,
  ]);

  const AVATAR_FILL = hex8toRGBA(AVATAR_COLOR, 0.28);
  const AVATAR_STROKE = hex8toHex(AVATAR_COLOR);
  const TEXT_FILL = hex8toRGBA(TEXT_COLOR, 0.28);
  const TEXT_STROKE = hex8toHex(TEXT_COLOR);

  const strKey = (s: string) => s.split("_").pop();

  $: avatarStats = ($statistics?.tlx?.avatar ?? []).map((a) => ({
    key: strKey(a.label),
    label: $_(a.labelKey),
    low: +a.min,
    q1: +a.q1,
    median: +a.median,
    q3: +a.q3,
    high: +a.max,
  }));

  $: textStats = ($statistics?.tlx?.text ?? []).map((t) => ({
    key: strKey(t.label),
    label: $_(t.labelKey),
    low: +t.min,
    q1: +t.q1,
    median: +t.median,
    q3: +t.q3,
    high: +t.max,
  }));

  $: byKeyA = new Map(avatarStats.map((d) => [d.key, d]));
  $: paired = textStats
    .map((t) => {
      const a = byKeyA.get(t.key);
      return a
        ? {
            key: t.key,
            label: t.label,
            A: [a.low, a.q1, a.median, a.q3, a.high],
            T: [t.low, t.q1, t.median, t.q3, t.high],
          }
        : null;
    })
    .filter(Boolean) as {
    key: string;
    label: string;
    A: number[];
    T: number[];
  }[];

  $: categories = paired.map((p) => p.label);
  $: dataAvatar = paired.map((p) => p.A);
  $: dataText = paired.map((p) => p.T);

  $: perfIndex = categories.findIndex((c) =>
    /erfolgreich|performance/i.test(String(c))
  );
  const medianFromParams = (p: any) => {
    const v = p?.value ?? p?.data;
    const m = Array.isArray(v) ? v[2] : undefined;
    return Number.isFinite(m) ? Number(m) : null;
  };

  const medianLabel = (p: any) => {
    const m = medianFromParams(p);
    return m === null ? "" : m.toFixed(1);
  };

  const medianPoints = (arr: number[][]) =>
    arr.map((row, i) => ({ value: [i, row?.[2]] }));

  $: option = {
    legend: { top: 0, data: ["Avatar", "Text"] },
    tooltip: { show: false },
    grid: { left: 40, right: 10, top: 32, bottom: 12, containLabel: true },
    xAxis: {
      type: "category",
      data: categories,
      axisLabel: {
        interval: 0,
        width: 86,
        overflow: "break",
        lineHeight: 12,
        formatter: (val: string, idx: number) =>
          idx === perfIndex ? `${val}  (↑ besser)` : val,
      },
      axisTick: { alignWithLabel: true },
    },
    yAxis: {
      min: 1,
      max: 7,
      name: "Likert 1–7 (niedriger = weniger Workload)",
      nameLocation: "middle",
      nameGap: 28,
    },
    series: [
      {
        name: "Avatar",
        type: "boxplot",
        data: dataAvatar,
        boxWidth: [14, 50],
        itemStyle: {
          color: AVATAR_FILL,
          borderColor: AVATAR_STROKE,
          borderWidth: 1,
        },
        label: {
          show: true,
          position: "inside",
          formatter: medianLabel,
          fontWeight: "bold",
        },
        labelLayout: { hideOverlap: true },
      },
      {
        name: "Avatar (median labels)",
        type: "scatter",
        data: medianPoints(dataAvatar),
        symbolSize: 0,
        tooltip: { show: false },
        silent: true,
        z: 5,
        label: {
          show: true,
          position: "inside",
          offset: [-20, -6],
          formatter: ({ value }: any) =>
            Number.isFinite(value?.[1]) ? Number(value[1]).toFixed(1) : "",
          fontWeight: "bold",
          color: AVATAR_STROKE,
        },
        emphasis: { disabled: true },
      },
      {
        name: "Text",
        type: "boxplot",
        data: dataText,
        boxWidth: [14, 50],
        itemStyle: {
          color: TEXT_FILL,
          borderColor: TEXT_STROKE,
          borderWidth: 1,
        },
        label: { show: true, position: "inside", formatter: medianLabel },
        labelLayout: { hideOverlap: true },
      },
      {
        name: "Text (median labels)",
        type: "scatter",
        data: medianPoints(dataText),
        symbolSize: 0,
        tooltip: { show: false },
        silent: true,
        z: 5,
        label: {
          show: true,
          position: "inside",
          offset: [20, -6],
          formatter: ({ value }: any) =>
            Number.isFinite(value?.[1]) ? Number(value[1]).toFixed(1) : "",
          color: TEXT_STROKE,
        },
        emphasis: { disabled: true },
      },
    ],
    toolbox: downloadChart(),
  };
</script>

<Container title="NASA-TLX: Avatar vs. Text" description=""
  ><!-- Boxplots je Subskala (Likert 1–7). Median-Linie mit leicht versetztem Label direkt auf der Linie." -->
  <Chart {init} options={option} style="width:100%;height:340px" />
</Container>
