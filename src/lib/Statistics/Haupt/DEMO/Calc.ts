import { statistics } from "$lib/Statistics/Logic/Aggregate";
import { AGE_BIN_SIZE } from "$lib/Statistics/Logic/HelpersCharts";
import { get } from "svelte/store";

export function createAgeBins() {
    const demoData =get(statistics)?.demographie?.aggregated ?? {};
    const ageRaw = demoData?.demo_age?.values || [];
    const agePoints = ageRaw
    .map((v) => ({ age: Number(v.x), count: Number(v.y) }))
    .filter((p) => Number.isFinite(p.age));

    const ageBinMap = new Map();
    agePoints.forEach(({ age, count }) => {
        const binStart = Math.floor(age / AGE_BIN_SIZE) * AGE_BIN_SIZE;
        ageBinMap.set(binStart, (ageBinMap.get(binStart) || 0) + count);
    });

    const ageLabels = Array.from(ageBinMap.keys())
    .sort((a, b) => a - b)
    .map((b) => `${b}-${b + AGE_BIN_SIZE - 1}`);

    const ageTotals = Array.from(ageBinMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([, y]) => y);

    const ageLabelIndex = new Map(ageLabels.map((lbl, i) => [lbl, i]));

    return {
        result :{
            ageRaw,
            agePoints,
            ageBinMap,
            ageLabels,
            ageTotals,
            ageLabelIndex,
        }
    }
}


export const getStatus = (id) => {
    const demo_ai_arr = get(statistics).demographie?.aggregated?.demo_status?.values;
    const el =
      demo_ai_arr.find((e) => Object.keys(e.by_session).includes(id)) || {};
    return el ? el.x : null; 
  };

export function getTaskCorrectness() {
    if(!(get(statistics).demographie?.aggregated?.demo_status?.values?.length > 0)) return

  const taskCorrectnessMap = Object.values(get(statistics).tasks.ab_metrics)
    .map((e) => e.taskCorrectness?.values_x_session_id)
    .flat()
    .reduce((acc, e) => {
      const sid = e.session_id;
      const isCorrect = e.answer === "CORRECT" ? 1 : 0;
      if (!acc[sid]) acc[sid] = { numCorrect: 0, statusByUser: getStatus(sid)};
      acc[sid].numCorrect += isCorrect;
      return acc;
    }, {});

    return taskCorrectnessMap
}
