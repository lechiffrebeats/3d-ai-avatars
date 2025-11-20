<script>
  import { downloadChart } from "$lib/Statistics/Logic/Export";

  const meta = (r) => r?.session?.meta || r?.meta || {};
  $: maleCount = rows.reduce(
    (n, r) => n + (meta(r).avatar_gender === "male" ? 1 : 0),
    0
  );
  $: femaleCount = rows.reduce(
    (n, r) => n + (meta(r).avatar_gender === "female" ? 1 : 0),
    0
  );

  $: maxCount = Math.max(maleCount, femaleCount, 0);
  const headroom = 1;
  const iconBump = 1;
  $: avatarOptions = {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: 40, right: 20, top: 30, bottom: 40 },
    xAxis: {
      type: "category",
      data: ["David", "Susanne", "Other"],
      axisTick: { alignWithLabel: true },
    },
    yAxis: { type: "value", min: 0, max: maxCount + headroom, minInterval: 1 },
    toolbox: downloadChart("interface"),
    series: [
      {
        type: "bar",
        data: [avatarCount, textCount, 0],
        barMaxWidth: 36,
        itemStyle: { borderRadius: [4, 4, 0, 0] },
        label: { show: true, position: "top" },
        markPoint: {
          symbolKeepAspect: true,
          symbolSize: [56, 56],
          data: [
            {
              coord: ["David", avatarCount + iconBump],
              symbol: `image://${malePNG}`,
            },
            {
              coord: ["Susanne", textCount + iconBump],
              symbol: `image://${femalePNG}`,
            },
          ],
        },
      },
    ],
  };
</script>
