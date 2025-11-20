<!-- Trust x Order -->
<script>
  import { statistics } from "$lib/Statistics/Logic/Aggregate";

  import { Chart } from "svelte-echarts";
  import { init, use } from "echarts/core";
  import { BarChart } from "echarts/charts";
  import {
    GraphicComponent,
    GridComponent,
    LegendComponent,
    TooltipComponent,
  } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";
  import Container from "$lib/Statistics/Helper/Container.svelte";

  import { ScatterChart } from "echarts/charts";
  use([
    ScatterChart,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    CanvasRenderer,
    BarChart,
    GraphicComponent,
  ]);

  import { groupByProp } from "$lib/Statistics/Logic/HelpersStatisitcs";
  import { metric_form_general } from "$lib/Statistics/Logic/HelpersMath";
  import { downloadChart } from "$lib/Statistics/Logic/Export";
  import { random_id } from "$lib/Evaluation/EvalSystem";

  const ordered = groupByProp(
    $statistics?.all?.aggregated?.map((s) => {
      const sid = s.session_id;
      const fin = $statistics.final.aggregated;
      return {
        session_id: sid,
        order: s.order,
        session: s,
        trust: fin.comp_trust?.values_x_session_id?.find(
          (e) => e.session_id === sid
        ).answer,
        comfort: fin.comp_comfort?.values_x_session_id?.find(
          (e) => e.session_id === sid
        ).answer,
        understanding: fin.comp_understanding?.values_x_session_id?.find(
          (e) => e.session_id === sid
        ).answer,
      };
    }),
    "order"
  );
  const AB = {
    trust: metric_form_general(ordered.AB?.map((s) => s.trust)),
    comfort: metric_form_general(ordered.AB?.map((s) => s.comfort)),
    understanding: metric_form_general(ordered.AB?.map((s) => s.understanding)),
  };
  const BA = {
    trust: metric_form_general(ordered.BA?.map((s) => s.trust)),
    comfort: metric_form_general(ordered.BA?.map((s) => s.comfort)),
    understanding: metric_form_general(ordered.BA?.map((s) => s.understanding)),
  };

  /* const valuesFinalBySession = summarizeQuestionMetrics(allGaaisVals, 5, true); */

  const x = ["AB", "BA"];
  const trustData = [AB.trust?.mean ?? null, BA.trust?.mean ?? null];
  const comfortData = [AB.comfort?.mean ?? null, BA.comfort?.mean ?? null];
  const understandingData = [
    AB.understanding?.mean ?? null,
    BA.understanding?.mean ?? null,
  ];

  $: options = {
    grid: { left: 50, right: 20, top: 60, bottom: 40, containLabel: true },
    tooltip: { trigger: "axis" },
    legend: { top: 0 },
    xAxis: {
      type: "category",
      name: "Reihenfolge",
      data: x,
      nameLocation: "middle",
      nameGap: 28,
    },
    yAxis: { type: "value", name: "Mittelwert (1–7)", min: 1, max: 7 },
    series: [
      {
        name: "Trust",
        type: "bar",
        data: trustData,
        label: {
          show: true,
          position: "top",
          formatter: ({ value }) =>
            (value ?? "").toFixed ? value.toFixed(2) : "",
        },
      },
      {
        name: "Comfort",
        type: "bar",
        data: comfortData,
        label: {
          show: true,
          position: "top",
          formatter: ({ value }) =>
            (value ?? "").toFixed ? value.toFixed(2) : "",
        },
      },
      {
        name: "Understanding",
        type: "bar",
        data: understandingData,
        label: {
          show: true,
          position: "top",
          formatter: ({ value }) =>
            (value ?? "").toFixed ? value.toFixed(2) : "",
        },
      },
    ],
    labelLayout: { hideOverlap: true },
    toolbox: downloadChart(random_id()),
  };
</script>

<Container
  title="Reihenfolge-Effekt (Final Ratings)"
  description="AB vs. BA – Mittelwerte"
>
  <Chart {init} {options} style="width:100%;height:320px" />
</Container>

<!-- <small>Delta = Trust_Avatar − Trust_Text {}</small> -->
