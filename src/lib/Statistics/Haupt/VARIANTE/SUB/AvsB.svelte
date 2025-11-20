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

  use([
    BoxplotChart,
    GridComponent,
    DatasetComponent,
    LegendComponent,
    TooltipComponent,
    CanvasRenderer,
  ]);

  const hex8toRGBA = (hex: string, a = 1) => {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(
      hex
    );
    if (!m) return `rgba(0,0,0,${a})`;
    const r = parseInt(m[1], 16),
      g = parseInt(m[2], 16),
      b = parseInt(m[3], 16);
    return `rgba(${r},${g},${b},${a})`;
  };
  const hex8toHex = (hex: string) => `#${hex.replace("#", "").slice(0, 6)}`;

  const AVATAR_FILL = hex8toRGBA(AVATAR_COLOR, 0.28);
  const AVATAR_STROKE = hex8toHex(AVATAR_COLOR);
  const TEXT_FILL = hex8toRGBA(TEXT_COLOR, 0.28);
  const TEXT_STROKE = hex8toHex(TEXT_COLOR);

  const strKey = (s: string) => s.split("_").pop();

  $: avatarStats = ($statistics?.variantRating?.avatar ?? []).map((a) => ({
    key: strKey(a.id),
    label: $_(a.labelKey),
    low: Number(a.min),
    q1: Number(a.q1),
    median: Number(a.median),
    q3: Number(a.q3),
    high: Number(a.max),
  }));

  $: textStats = ($statistics?.variantRating?.text ?? []).map((t) => ({
    key: strKey(t.id),
    label: $_(t.labelKey),
    low: Number(t.min),
    q1: Number(t.q1),
    median: Number(t.median),
    q3: Number(t.q3),
    high: Number(t.max),
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
    tooltip: { show: true },
    grid: { left: 40, right: 10, top: 32, bottom: 8, containLabel: true },
    xAxis: {
      type: "category",
      data: categories,
      axisLabel: { interval: 0, width: 86, overflow: "break", lineHeight: 12 },
      axisTick: { alignWithLabel: true },
    },
    yAxis: {
      min: 0,
      max: 7,
      name: "Likert 1–7 (höher = positiver bewertet)",
      nameLocation: "middle",
      nameGap: 28,
    },
    series: [
      {
        name: "Avatar",
        type: "boxplot",
        data: dataAvatar,
        boxWidth: [14, 40],
        itemStyle: {
          color: AVATAR_FILL,
          borderColor: AVATAR_STROKE,
          borderWidth: 1,
        },
        silent: true,
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
        silent: true,
        tooltip: { show: false },
        z: 5,
        label: {
          show: true,
          offset: [-30, -6],

          position: "inside",
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
        silent: true,
        data: dataText,
        boxWidth: [14, 40],
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
        silent: true,
        data: medianPoints(dataText),
        symbolSize: 0,
        tooltip: { show: false },
        z: 5,
        label: {
          offset: [30, -6],
          show: true,
          position: "inside",
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

<Container title="Variant Rating: Avatar vs. Text" description="">
  <!-- Boxplots (min–q1–Median–q3–max) je Item (Likert 1–7). Median-Linie sichtbar & zusätzlich im Kasten beschriftet. -->
  <Chart {init} options={option} style="width:100%;height:340px" />
</Container>
