<script>
  import { Chart } from "svelte-echarts";
  import { init, use } from "echarts/core";
  import { BarChart, PieChart } from "echarts/charts";
  import {
    GridComponent,
    LegendComponent,
    TooltipComponent,
  } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";
  import { statistics } from "$lib/Statistics/Logic/Aggregate";
  import Container from "$lib/Statistics/Helper/Container.svelte";
  import ChartGrid from "$lib/Statistics/Helper/ChartGrid.svelte";
  import {
    AGE_BIN_SIZE,
    BIN,
    buildCategoryAxis,
    buildIntegerYAxis,
    countsByScale,
    LIKERT_SEVEN_SCALE,
    maxValue,
  } from "$lib/Statistics/Logic/HelpersCharts";
  import Status from "./SUB/Lang.svelte";
  import Staus from "./SUB/Stauts.svelte";
  import { downloadChart } from "$lib/Statistics/Logic/Export";

  use([
    BarChart,
    PieChart,
    GridComponent,
    LegendComponent,
    TooltipComponent,
    CanvasRenderer,
  ]);

  /* ------------------------------------------------------------------------ */
  /* DATA ACCESS */
  $: demoData = $statistics?.demographie?.aggregated ?? {};
  $: allSessions = $statistics?.all?.aggregated || [];
  $: rowsAll = allSessions;

  /* ------------------------------------------------------------------------ */

  $: ageRaw = demoData?.demo_age?.values || [];
  $: agePoints = ageRaw
    .map((v) => ({ age: Number(v.x), count: Number(v.y) }))
    .filter((p) => Number.isFinite(p.age));

  $: ageBinMap = new Map();
  $: agePoints.forEach(({ age, count }) => {
    const binStart = Math.floor(age / AGE_BIN_SIZE) * AGE_BIN_SIZE;
    ageBinMap.set(binStart, (ageBinMap.get(binStart) || 0) + count);
  });

  $: ageLabels = Array.from(ageBinMap.keys())
    .sort((a, b) => a - b)
    .map((b) => `${b}-${b + AGE_BIN_SIZE - 1}`);

  $: ageLabelIndex = new Map(ageLabels.map((lbl, i) => [lbl, i]));
  $: genderStacks = {
    male: Array(ageLabels.length).fill(0),
    female: Array(ageLabels.length).fill(0),
    diverse: Array(ageLabels.length).fill(0),
    no_answer: Array(ageLabels.length).fill(0),
    other: Array(ageLabels.length).fill(0),
  };

  $: allSessions.forEach((row) => {
    const session = row.session ?? row;
    const d = session?.questionary_demo || row?.questionary_demo || {};
    const age = Number(d?.demo_age);
    const gender = String(d?.demo_gender || "other");
    if (!Number.isFinite(age)) return;
    const binStart = Math.floor(age / AGE_BIN_SIZE) * AGE_BIN_SIZE;
    const label = `${binStart}-${binStart + AGE_BIN_SIZE - 1}`;
    const idx = ageLabelIndex.get(label);
    if (idx == null) return;
    if (genderStacks[gender] == null) genderStacks.other[idx] += 1;
    else genderStacks[gender][idx] += 1;
  });

  $: ageGenderSeries = Object.entries(genderStacks)
    .filter(([, arr]) => arr.some((v) => v > 0))
    .map(([name, data]) => ({
      name,
      type: "bar",
      stack: "total",
      data,
      barMaxWidth: 38,
    }));

  /* MAIN AGE */
  $: ageOptions = {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    legend: { top: 0 },
    grid: { left: 60, right: 20, top: 28, bottom: 60 },
    xAxis: buildCategoryAxis(ageLabels, `Alter (${BIN}-Jahre Kontainer)`),
    yAxis: buildIntegerYAxis(12, "Anzahl Personen"),
    series: ageGenderSeries,
    toolbox: downloadChart(),
  };

  /* ------------------------------------------------------------------------ */
  /* DEVICE (donut) */

  $: deviceRaw = demoData?.demo_device?.values || [];
  $: deviceSeriesData = deviceRaw.map((v) => ({
    name: String(v.x),
    value: Number(v.y),
  }));
  const PCT_DEC = 1;
  const fmtPct = (x) => x.toFixed(PCT_DEC);
  $: totalDevice = deviceSeriesData.reduce(
    (s, d) => (Number.isFinite(d.value) ? s + d.value : s),
    0
  );

  const niceDevice = (d) => {
    switch (d) {
      case "desktop":
        return "Desktop";
      case "tablet":
        return "Tablet";
      case "mobile":
        return "Mobile";
      case "laptop":
        return "Laptop";
      default:
        return d;
    }
  };

  $: deviceOptions = {
    tooltip: {
      trigger: "item",
      formatter: (p) => {
        const pct = totalDevice ? (p.value / totalDevice) * 100 : 0;
        return `${p.name}: ${p.value} (${fmtPct(pct)}%)`;
      },
    },
    grid: { left: 40, right: 20, top: 70, bottom: 40 },
    legend: { top: 0 },
    series: [
      {
        name: "Gerät",
        type: "pie",
        radius: ["45%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: { borderColor: "#fff", borderWidth: 1 },
        label: {
          show: true,
          position: "outside",
          formatter: (p) => {
            const pct = totalDevice ? (p.value / totalDevice) * 100 : 0;
            return `${niceDevice(p.name)}\n${fmtPct(pct)}%`;
          },
        },
        labelLine: { show: true, length: 12, length2: 8 },
        data: deviceSeriesData,
      },
    ],
    toolbox: downloadChart(),
  };

  /* ------------------------------------------------------------------------ */
  /* GENDER (overall) */

  $: genderRaw = demoData?.demo_gender?.values || [];
  $: genderSorted = [...genderRaw].sort((a, b) =>
    String(a.x).localeCompare(String(b.x))
  );
  $: genderCategories = genderSorted.map((v) => String(v.x));
  $: genderCounts = genderSorted.map((v) => Number(v.y));

  $: genderOptions = {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: 40, right: 20, top: 10, bottom: 40 },
    xAxis: buildCategoryAxis(genderCategories, "Geschlecht", { width: 120 }),
    yAxis: buildIntegerYAxis(maxValue(genderCounts), "Anzahl"),
    series: [{ type: "bar", data: genderCounts, barMaxWidth: 28 }],
  };

  /* ------------------------------------------------------------------------ */
  /* LIKERT: AI vs Domain  */

  $: aiRaw = demoData?.demo_ai_experience?.values || [];
  $: domainRaw = demoData?.demo_domain_familiarity?.values || [];
  $: aiCounts = countsByScale(aiRaw);
  $: domainCounts = countsByScale(domainRaw);
  $: likertMax = maxValue([...aiCounts, ...domainCounts]);

  $: famOptions = {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    legend: { top: 0 },
    grid: { left: 40, right: 20, top: 40, bottom: 40 },
    xAxis: buildCategoryAxis(LIKERT_SEVEN_SCALE, "Level Likert (1–7)"),
    yAxis: buildIntegerYAxis(7, "Anzahl Antworten"),
    series: [
      {
        name: "Erfahrung mit KI",
        type: "bar",
        data: aiCounts,
        barGap: "20%",
        barMaxWidth: 44,
      },
      {
        name: "Kenntnisse Masterstudiengange Informatik",
        type: "bar",
        data: domainCounts,
        barMaxWidth: 44,
      },
    ],
    toolbox: downloadChart(),
  };
</script>

<!-- <GlassBox {dataarr} /> -->

<ChartGrid>
  <Container
    title="Age × Gender"
    description={`Stacked by gender, ${BIN}-year bins. ${rowsAll.length} participants`}
  >
    <Chart {init} options={ageOptions} style="width:100%;height:290px" />
  </Container>

  <Container
    title="Devices"
    description={`Device type distribution. ${rowsAll.length} participants`}
  >
    <Chart {init} options={deviceOptions} style="width:100%;height:290px" />
  </Container>

  <Container
    title="Gender"
    description={`Overall gender distribution. ${rowsAll.length} participants`}
  >
    -
    <Chart {init} options={genderOptions} style="width:100%;height:290px" />
  </Container>

  <Container
    title="AI Experience vs Domain Familiarity"
    description={`Likert 1–7 counts. ${rowsAll.length} responses`}
  >
    <Chart {init} options={famOptions} style="width:100%;height:290px" />
  </Container>

  <Status />
  <Staus />
</ChartGrid>
