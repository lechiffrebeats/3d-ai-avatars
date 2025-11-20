<script lang="ts">
  import { onMount } from "svelte";
  import { Chart } from "svelte-echarts";
  import { init, use } from "echarts/core";
  import { BarChart, CustomChart } from "echarts/charts";
  import { GridComponent, TooltipComponent } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";
  import Container from "$lib/Statistics/Helper/Container.svelte";
  import { statistics } from "$lib/Statistics/Logic/Aggregate";
  import { times_of_completion_sessions } from "$lib/Statistics/Logic/Overall";
  import { isoToHourLocal } from "$lib/Statistics/Logic/HelpersCharts";
  import { backgrounds } from "$lib/Agent/Avatar";
  import { None } from "vega";
  import { downloadChart } from "$lib/Statistics/Logic/Export";

  use([BarChart, CustomChart, GridComponent, TooltipComponent, CanvasRenderer]);

  const soc = times_of_completion_sessions($statistics.all.aggregated) || {};
  const bins = { day: 0, sunset: 0, night: 0 };
  for (const [ts, cnt] of Object.entries(soc)) {
    const h = isoToHourLocal(ts);
    if (h >= 6 && h <= 17) bins.day += Number(cnt) || 1;
    else if (h > 17 && h <= 22) bins.sunset += Number(cnt) || 1;
    else bins.night += Number(cnt) || 1;
  }

  const categories = ["Tag", "Abend", "Nacht"];
  const keys = ["day", "sunset", "night"];
  const dataVals = [bins.day, bins.sunset, bins.night];
  const total = Math.max(
    1,
    dataVals.reduce((s, v) => s + v, 0)
  );
  const pct = (v: number) => ((v / total) * 100).toFixed(1);

  const daySrc = backgrounds.day?.[0]?.src ?? "/backgrounds/defaultBlack.jpg";
  const sunsetSrc =
    backgrounds.sunset?.[0]?.src ?? "/backgrounds/defaultBlack.jpg";
  const nightSrc =
    backgrounds.night?.[0]?.src ?? "/backgrounds/defaultBlack.jpg";

  const imgs: Record<string, HTMLImageElement> = {
    day: new Image(),
    sunset: new Image(),
    night: new Image(),
  };
  imgs.day.crossOrigin = "anonymous";
  imgs.sunset.crossOrigin = "anonymous";
  imgs.night.crossOrigin = "anonymous";
  imgs.day.src = daySrc;
  imgs.sunset.src = sunsetSrc;
  imgs.night.src = nightSrc;

  let ready = 0;
  onMount(() => {
    const f = () => {
      ready += 1;
      option = { ...option };
    };
    imgs.day.onload = f;
    imgs.sunset.onload = f;
    imgs.night.onload = f;
  });

  const customData = categories.map((c, i) => [c, dataVals[i], keys[i]]);

  function renderItem(params: any, api: any) {
    const cat = api.value(0);
    const val = api.value(1);
    const key = api.value(2);
    const bottom = api.coord([cat, 0]);
    const top = api.coord([cat, val]);
    const bw = api.size([1, 0])[0] * 0.8;
    const x = bottom[0] - bw / 2;
    const y = top[1];
    const h = bottom[1] - top[1];
    const img = imgs[key as string];
    if (!img || !img.complete) return;
    return {
      type: "image",
      style: { image: img, x, y, width: bw, height: h },
      clipPath: {
        type: "rect",
        shape: { x, y, width: bw, height: h, r: 6 },
      },
      silent: true,
      z: 1,
    };
  }

  $: option = {
    grid: { left: 56, right: 20, top: 40, bottom: 1, containLabel: true },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (ps: any[]) => {
        if (!ps?.length) return "";
        const i = ps[0].dataIndex;
        const name = categories[i];
        const val = dataVals[i];
        return `${name}: ${val} (${pct(val)}%)`;
      },
    },
    xAxis: {
      type: "category",
      data: categories,
      axisTick: { alignWithLabel: true },
    },
    yAxis: { type: "value", name: "Sessions", min: 0, minInterval: 1 },
    series: [
      {
        type: "custom",
        renderItem,
        encode: { x: 0, y: 1 },
        data: customData,
        z: 1,
      },
      {
        type: "bar",
        data: dataVals,
        barMaxWidth: 78,
        itemStyle: {
          color: "rgba(0,0,0,0)",
          border: "none",
          borderWidth: 1,
          borderRadius: [6, 6, 0, 0],
        },
        label: {
          show: true,
          position: "top",
          formatter: (p: any) => `${p.value} (${pct(p.value)}%)`,
        },
        z: 2,
      },
    ],
    toolbox: downloadChart(),
  };
</script>

<!-- <Container title="Abschlusszeit nach Hintergrund" description="">
  <Chart {init} options={option} style="width:100%;height:320px" />
</Container>
 -->
