<script lang="ts">
  import { Chart } from "svelte-echarts";
  import { init, use } from "echarts/core";
  import { BarChart } from "echarts/charts";
  import {
    GridComponent,
    LegendComponent,
    TooltipComponent,
  } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";
  import Container from "$lib/Statistics/Helper/Container.svelte";

  import { statistics } from "$lib/Statistics/Logic/Aggregate";
  import { AVATAR_COLOR, TEXT_COLOR } from "$lib/General";
  import { downloadChart } from "$lib/Statistics/Logic/Export";
  const CANON_KEY: Record<string, string> = {
    "avatar-task-ws-deadline-v1": "deadline",
    "text-task-ss-deadline-v1": "deadline",
    "avatar-task-thesis-cp-v1": "credits",
    "text-task-master-total-cp-v1": "credits",
    "avatar-task-msc-eligibility-test-v1": "requirements",
    "text-task-ml-prereq-v1": "requirements",
  };
  const getCanonKey = (id: string) => CANON_KEY[id] ?? id;

  use([
    BarChart,
    GridComponent,
    LegendComponent,
    TooltipComponent,
    CanvasRenderer,
  ]);

  const CANON_LABELS: Record<string, string> = {
    deadline: "Bewerbungsfrist",
    credits: "Kreditpunkte",
    requirements: "Zulassungsvoraussetzungen",
  };
  const canonNice = (c: string) => CANON_LABELS[c] ?? c;

  const num = (v: any) => Number(v ?? NaN);
  const asPct1 = (v: any) => {
    const n = num(v);
    return Number.isFinite(n) ? Number(n.toFixed(1)) : null;
  };

  $: aMetrics = $statistics?.tasks?.a_metrics ?? {};
  $: bMetrics = $statistics?.tasks?.b_metrics ?? {};

  function collectCanonMap() {
    const out = new Map<
      string,
      { avatar: number | null; text: number | null }
    >();

    for (const [id, ent] of Object.entries(aMetrics)) {
      const canon = getCanonKey(id);
      const pct = asPct1(ent?.taskCorrectness?.percentageCorrect);
      const prev = out.get(canon) ?? { avatar: null, text: null };
      out.set(canon, { ...prev, avatar: pct });
    }

    for (const [id, ent] of Object.entries(bMetrics)) {
      const canon = getCanonKey(id);
      const pct = asPct1(ent?.taskCorrectness?.percentageCorrect);
      const prev = out.get(canon) ?? { avatar: null, text: null };
      out.set(canon, { ...prev, text: pct });
    }

    return out;
  }

  $: canonMap = collectCanonMap();
  const ORDER = ["deadline", "credits", "requirements"];
  $: canonKeys = ORDER.filter((k) => canonMap.has(k));

  $: taskLabels = canonKeys.map(canonNice);
  $: dataAvatar = canonKeys.map((k) => canonMap.get(k)?.avatar ?? null);
  $: dataText = canonKeys.map((k) => canonMap.get(k)?.text ?? null);

  $: option = {
    grid: { left: 40, right: 20, top: 48, bottom: 40, containLabel: true },
    legend: { top: 8 },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      valueFormatter: (v: any) =>
        v == null ? "–" : `${Number(v).toFixed(1)}%`,
    },
    xAxis: {
      type: "category",
      data: taskLabels,
      axisLabel: { interval: 0, rotate: 0 },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: 100,
      axisLabel: { formatter: "{value}%" },
      splitLine: { show: true },
    },
    series: [
      {
        name: "Avatar-Interface",
        type: "bar",
        data: dataAvatar,
        barMaxWidth: 28,
        itemStyle: { color: AVATAR_COLOR, borderRadius: [4, 4, 0, 0] },
        label: {
          show: true,
          position: "top",
          formatter: ({ value }: any) =>
            value == null ? "" : `${Number(value).toFixed(1)}%`,
        },
        emphasis: { itemStyle: { opacity: 0.85 } },
      },
      {
        name: "Text-Interface",
        type: "bar",
        data: dataText,
        barMaxWidth: 28,
        itemStyle: {
          color: typeof TEXT_COLOR !== "undefined" ? TEXT_COLOR : "#6b7280",
          borderRadius: [4, 4, 0, 0],
        },
        label: {
          show: true,
          position: "top",
          formatter: ({ value }: any) =>
            value == null ? "" : `${Number(value).toFixed(1)}%`,
        },
        emphasis: { itemStyle: { opacity: 0.85 } },
      },
    ],
    /* graphic: kpi?.graphic ?? [], */
    toolbox: downloadChart(),
  };
</script>

<Container
  title="Aufgaben: Korrekt gelöst (%) – Avatar vs. Text (nach Aufgabe)"
  description="Pro Aufgabe (kanonisch): Anteil korrekt gelöster Antworten, getrennt nach Interface."
>
  <Chart {init} options={option} style="width:100%;height:340px" />
</Container>
