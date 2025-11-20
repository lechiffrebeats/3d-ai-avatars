<script>
  import ChartGrid from "$lib/Statistics/Helper/ChartGrid.svelte";
  import { statistics } from "$lib/Statistics/Logic/Aggregate";
  import GAAISTEMPLATE from "./SUB/GAAIS_TEMPLATE.svelte";
  import Metrics from "./SUB/GAAISMetrics.svelte";
  import GAAISMetricsOverall from "./SUB/GAAISMetricsOverall.svelte";
  import GAAISxAiExp from "./SUB/GAAISxAiExp.svelte";
  import GAAISXDEMO from "./SUB/GAAISxDomFam.svelte";

  const positive = $statistics.gaais.positive;
  const negative = $statistics.gaais.negative;
  const positiveTitle = "Frequencies of responses to positive statements";
  const positiveDescription =
    "Percantages of disagree, neutral and agree per question, we combined (dis)agreement from the “strongly” and “somewhat” levels so its [(1,2), 3, (4,5)]";
  const negativeTitle = "Frequencies of responses to negative statements";
  const negativeDescription =
    "Percantages of disagree, neutral and agree per question, we combined (dis)agreement from the “strongly” and “somewhat” levels so its [(1,2), 3, (4,5)]";
</script>

<GAAISTEMPLATE
  entries={positive}
  postive={true}
  title={positiveTitle}
  description={positiveDescription}
  barHeight={370}
/>
<GAAISTEMPLATE
  entries={negative}
  postive={false}
  title={negativeTitle}
  description={negativeDescription}
  barHeight={300}
/>

<GAAISMetricsOverall />

<ChartGrid>
  <!--   <GAAISXDEMO />
  <GAAISxAiExp></GAAISxAiExp> -->
</ChartGrid>
<Metrics />
