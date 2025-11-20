<script>
  import * as echarts from "echarts/core";
  import { BarChart } from "echarts/charts";
  import {
    GridComponent,
    LegendComponent,
    TooltipComponent,
  } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";
  import { _ } from "@rgglez/svelte-i18n";
  import AVSBFINAL from "./SUB/AVSBFINAL.svelte";

  echarts.use([
    BarChart,
    GridComponent,
    LegendComponent,
    TooltipComponent,
    CanvasRenderer,
  ]);
</script>

<AVSBFINAL />
<!-- Reihnfolge -->
<!-- <AvatarTextFinal /> -->
