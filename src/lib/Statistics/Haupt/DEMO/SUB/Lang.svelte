<script lang="ts">
  import { Chart } from "svelte-echarts";
  import { init, use } from "echarts/core";
  import { languages } from "$lib/Misc/sessionStore";
  import { BarChart } from "echarts/charts";
  import {
    GraphicComponent,
    GridComponent,
    LegendComponent,
    TooltipComponent,
  } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";
  import { statistics } from "$lib/Statistics/Logic/Aggregate";
  import Container from "$lib/Statistics/Helper/Container.svelte";
  import { AVATAR_COLOR } from "$lib/General";

  import { ScatterChart } from "echarts/charts";
  import { getTaskCorrectness } from "../Calc";
  import { getSessionById } from "$lib/Statistics/Logic/HelpersStatisitcs";
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

  const xLabels = ["native", "C2", "C1", "B2", "B1_or_lower", "no_answer"];

  const getNumberForNameAndLang = (t) => {
    const result =
      $statistics.demographie?.aggregated?.demo_lang_level?.values?.find(
        (s) => s.x === t
      );
    if (!result || result.length == 0) return { de: 0, en: 0 };

    const numDe =
      Object.keys(result.by_session)?.filter(
        (s) => getSessionById(s)?.meta?.lang === "de"
      )?.length || 0;
    const numEn =
      Object.keys(result.by_session)?.filter(
        (s) => getSessionById(s)?.meta?.lang === "en"
      )?.length || 0;

    return { de: numDe, en: numEn };
  };

  $: dataSeries = Object.values(
    xLabels.map((name) => ({
      x: name,
      de: getNumberForNameAndLang(name).de,
      en: getNumberForNameAndLang(name).en,
      total:
        getNumberForNameAndLang(name).de + getNumberForNameAndLang(name).en,
    }))
  ).sort((a, b) => Number(b.total) - Number(a.total));

  $: lineOptions = {
    grid: { left: 50, right: 50, top: 40, bottom: 30, containLabel: true },
    tooltip: {
      trigger: "axis",
    },
    xAxis: {
      name: "Level",
      type: "category",
      data: dataSeries?.map((s) => s.x),
      min: 0,
      max: 5,
      alignWithLabel: true,
      nameLocation: "middle",
      nameGap: 60,
      axisLabel: {
        interval: 0,
        width: 83,
        rotate: 45,
        overflow: "break",
        lineHeight: 10,
      },
      axisTick: { alignWithLabel: true },
    },
    yAxis: {
      name: "Anzahl",
      type: "value",
      min: 0,
      max: 20,
    },
    series: [
      {
        type: "bar",
        name: "German",
        data: dataSeries.map((s) => s.de),
        itemStyle: { color: "#000" },
        label: { show: true, position: "top" },
        markPoint: {
          symbolKeepAspect: true,
          symbolSize: [20, 20],
          data: dataSeries.map((s, i) => ({
            coord: [s.x, s.de],
            symbol: "image:///flags/german.svg",
            seriesIndex: 0,
          })),
        },
      },
      {
        type: "bar",
        name: "English",
        data: dataSeries.map((s) => s.en),
        itemStyle: { color: "#999" },
        label: { show: true, position: "top" },
        markPoint: {
          symbolKeepAspect: true,
          symbolSize: [20, 20],
          data: dataSeries.map((s, i) => ({
            coord: [s.x, s.en],
            symbol: "image:///flags/usa.svg",
          })),
        },
      },
    ],
    toolbox: downloadChart(),
  };
</script>

<Container title="Languages" description="">
  <Chart {init} options={lineOptions} style="width:100%;height:290px" />
</Container>
