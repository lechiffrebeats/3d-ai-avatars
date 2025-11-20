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
  import { AVATAR_COLOR } from "$lib/General";

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

  import {
    groupByProp,
    summarizeQuestionMetrics,
  } from "$lib/Statistics/Logic/HelpersStatisitcs";
  const domFamVals =
    $statistics.demographie.aggregated?.demo_domain_familiarity
      ?.values_x_session_id;

  const pos_x_domFam = Object.entries($statistics.gaais.by_session)?.map(
    ([sid, responses]) => {
      return {
        session_id: sid,
        gaais: responses,
        domain: domFamVals?.find((d) => d.session_id === sid).answer,
      };
    }
  );
  const pos_x_domFam_grouped_domain = groupByProp(pos_x_domFam, "domain");

  const final_pre = Object.entries(pos_x_domFam_grouped_domain)?.map(
    ([domainLevel, sessions]) => {
      const allGaaisVals = sessions?.map((s) => s.gaais).flat();

      return {
        domainLevel,
        sessions,
        gaais: summarizeQuestionMetrics(allGaaisVals, 5, true),
      };
    }
  );

  $: options = {
    grid: { left: 50, right: 50, top: 40, bottom: 30, containLabel: true },
    tooltip: {
      trigger: "axis",
    },
    xAxis: {
      name: "Domain Familiarity",
      type: "category",
      data: [1, 2, 3, 4, 5, 6, 7].sort((a, b) => b - a) /* Bruther */,
      min: 0,
      max: 6,
      nameLocation: "middle",
      nameGap: 30,
    },
    yAxis: {
      name: "GAAIS Mean",
      type: "value",
      min: 0,
      max: 5,
    },
    series: [
      {
        type: "bar",
        showSymbol: true,
        data: final_pre.map((d) => d.gaais?.mean),
        itemStyle: { color: AVATAR_COLOR },
        lineStyle: { width: 3 },
      },
    ],
  };
</script>

<Container
  title="Domain Familiarity x GAAIS Means"
  description="GAAIS Metrics are reverse-scored ==> higher better | Sample Size: {pos_x_domFam.length}"
>
  <Chart {init} {options} style="width:100%;height:290px" />
</Container>
