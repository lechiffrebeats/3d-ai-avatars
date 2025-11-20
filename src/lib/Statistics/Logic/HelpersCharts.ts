import { mean, median, metric_form_general, sd } from "./HelpersMath";
import { groupByProp, metricFrom,  calcAllTaskCorrectness, metricFromMetrics, summarizeNormalizedUniversal } from "./HelpersStatisitcs";

export const AGE_BIN_SIZE = 5;
export const BIN = AGE_BIN_SIZE;
export const BIN_SIZE = 5;
export const LIKERT_SEVEN_SCALE = [1, 2, 3, 4, 5, 6, 7];
export const LIKERT_FIVE_SCALE = [1, 2, 3, 4, 5];
  export const COMP_TIME_SCALE_MS = [
    300000 ,   // 5min
    450000,
    600000, 
    720000,
    900000,  
    1200000,
    1500000,
    1800000, // 30 min
    2100000,
    2400000, 
    2700000,
    3000000,
    3600000,
    4500000,
    5400000,
    7200000, 
    1080000,
    1440000,
    1800000,
    2160000,
    2520000,
    2880000,
    3240000,
    3600000,
  ];


export const getBinIndexKey = (val, bins: number[]) => {
  const index = bins.findIndex((b) => b >= val);
  return {index, binValue: bins[index]};
}

export function countsByScale(valueList) {
  const counts = new Map(LIKERT_SEVEN_SCALE.map((s) => [s, 0]));
  (valueList || []).forEach((v) => {
    const n = Number(v.x);
    if (counts.has(n)) counts.set(n, counts.get(n) + Number(v.y));
  });
  return LIKERT_SEVEN_SCALE.map((s) => counts.get(s));
}

export function createTaskStatistics(tasks, isFreeTasks = false) {
  const sessions_groupedByTasks = groupByProp(tasks, "stable_key");
  
  const tasks_avatar = Object.fromEntries(Object.entries(sessions_groupedByTasks).filter(([t, _]) => String(t).startsWith("avatar")));
  const tasks__text = Object.fromEntries(Object.entries(sessions_groupedByTasks).filter(([t, _]) => String(t).startsWith("text")));

  const statsPerTasks = get_stats_tasks(sessions_groupedByTasks);
  const statsPersTasks_avatar = get_stats_tasks(tasks_avatar);
  const statsPersTasks_text = get_stats_tasks(tasks__text);
  
  const statsTotalTasksAvatar = get_stats_total_tasks(Object.values(statsPersTasks_avatar), "AVATAR", isFreeTasks);
  const statsTotalTasksText = get_stats_total_tasks(Object.values(statsPersTasks_text), "TEXT", isFreeTasks);
  
  return {statsPerTasks, statsTotalTasksAvatar, statsTotalTasksText, statsPersTasks_avatar, 
    statsPersTasks_text, tasks_avatar, tasks__text, sessions_groupedByTasks };
}

function get_stats_total_tasks(tasksvalues, int_type, isFreeTasks = false) {
    const responseCount = tasksvalues.reduce((s, t) => s + (t.count ?? 0), 0);
    const metricFormNestedAwnsers = (list, key) => {
      const answers = (list || []).map(t => t[key].answers ?? []).flat().filter((t) => t != null);
      const values_x_session_id = (list || []).map(t => t[key].values_x_session_id ?? [] ).flat().filter((t) => t != null);
      const metricsForThisOne = summarizeNormalizedUniversal(values_x_session_id, 7, false, int_type);
      return metricsForThisOne["undefined"];
    }

    const statsTotalTasks = {
      taskCount: tasksvalues.length, 
      count: responseCount, 
      int_type:      int_type,
      restOfData:    tasksvalues,
      taskCorrectnessAllThree: getForOneInterfaceCorrectness(tasksvalues, int_type),
    };

    if(isFreeTasks) {
      statsTotalTasks["comprehension"] = metricFormNestedAwnsers(tasksvalues, "comprehension");
      statsTotalTasks["pleasant"] = metricFormNestedAwnsers(tasksvalues, "pleasant");
    } else {
      statsTotalTasks["correctness"] = metricFormNestedAwnsers(tasksvalues, "correctness");
      statsTotalTasks["usefulness"] = metricFormNestedAwnsers(tasksvalues, "usefulness");
      statsTotalTasks["clarity"] = metricFormNestedAwnsers(tasksvalues, "clarity");
      statsTotalTasks["credibility"] = metricFormNestedAwnsers(tasksvalues, "credibility");
    }
    return statsTotalTasks;
}

function getForOneInterfaceCorrectness(tasksvalues, int_type) {
  
  const numberCorrect = tasksvalues.map((e)=> e.taskCorrectness.numberCorrect).flat().reduce((acc, e)=>acc +e, 0)
  const numberIncorrect = tasksvalues.map((e)=> e.taskCorrectness.numberIncorrect).flat().reduce((acc, e)=>acc +e, 0)
  const numberUnanswered = tasksvalues.map((e)=> e.taskCorrectness.numberUnanswered).flat().reduce((acc, e)=>acc +e, 0)
  const numberRest = 0
  const totalSum = numberCorrect + numberIncorrect + numberUnanswered + numberRest
  const total =  tasksvalues.map((e)=> e.taskCorrectness.total).flat().reduce((acc, e)=>acc +e, 0)
  const checker = totalSum === total

  return {numberCorrect,numberIncorrect, numberUnanswered, numberRest, total, checker}
}

export function getBaseMetrics(arr = []) {
  const DATA = metricFromMetrics(arr)
return [
      {
        type: "text",
        right: 8,
        top: 8,
        style: {
          text: `Avg ${DATA.mean.toFixed(1)}%`,
          fill: "#888",
          fontSize: 12,
        },
      },
      {
        type: "text",
        right: 8,
        top: 26,
        style: {
          text: `Med ${DATA.median.toFixed(1)}%`,
          fill: "#888",
          fontSize: 12,
        },
      },
      {
        type: "text",
        right: 8,
        top: 44,
        style: { text: `SD ${DATA.sd.toFixed(1)}%`, fill: "#888", fontSize: 12 },
      },
    ]}

function get_stats_tasks(groupedByTasks) {
  const statsPerTasks = {};
  const keys = Object.values(groupedByTasks)[0][0]?.eval_questions?.map((e)=> e.id).filter((e)=>e !== "note").flat()

  for (const [key, list] of Object.entries(groupedByTasks)) {
    statsPerTasks[key] = {
      count:        list.length,
      stable_key:   list[0],
      restOfData:   list,
      taskCorrectness: calcAllTaskCorrectness(list),
    };
    if(keys && keys.length > 0){
      for(const qid of keys) {
        statsPerTasks[key][qid] = metricFrom(list, qid)
      }
    }
  }
  return statsPerTasks;
}

export const maxValue = (arr) => (arr?.length ? Math.max(...arr) : 0);
export const roundNiceMax = (n) => {
if (n <= 5) return 5;
if (n <= 10) return n;
if (n <= 20) return n;
if (n <= 50) return 50;
if (n <= 100) return 100;
const mag = 10 ** Math.floor(Math.log10(n));
return Math.ceil(n / mag) * mag;
};
export const pickTickInterval = (max) => {
if (max <= 10) return 1;
if (max <= 20) return 2;
if (max <= 50) return 5;
if (max <= 100) return 10;
const mag = 10 ** Math.floor(Math.log10(max) - 1);
return 5 * mag;
};

const TZ = "Europe/Berlin";

export const isoToHourLocal = (iso: string, tz = TZ) => {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    hour12: false
  }).formatToParts(d);
  return Number(parts.find(p => p.type === "hour")?.value ?? "0");
};


export const buildIntegerYAxis = (maxVal, name) => {
  const upper = roundNiceMax(maxVal);
  return {
      type: "value",
      name,
      nameLocation: "middle",
      nameGap: 26,
      min: 0,
      max: upper,
      interval: pickTickInterval(upper),
      minInterval: 1,
      axisLabel: { formatter: (v) => (Number.isInteger(v) ? v : "") },
      splitLine: {
      show: true,
      lineStyle: { type: "solid", width: 1, opacity: 0.25 },
      },
      splitArea: { show: true, areaStyle: { opacity: 0.04 } },
  };
};

export const buildCategoryAxis = (data, name, options = {}) => ({
  type: "category",
  name,
  nameLocation: "middle",  
  nameGap: 30,
  data,
  axisTick: { alignWithLabel: true },
  axisLabel: {
    interval:  0,
    rotate: options.rotate || 0,          
    margin: options.margin || 12,            
    overflow: options.overflow || "truncate", 
    width: options.width || 90   
  }
});

export const wrapTextCharts = (s: string, limit = 12) =>
    String(s)
      .replace(new RegExp(`([^\\n]{1,${limit}})(\\s|$)`, "g"), "$1\n")
      .trim();

export const kpiBox = (
  vals: (number | string)[],
  {
    unit = "",
    decimals = 1,
    corner = "tr" as "tr" | "br" | "tl" | "bl",
    scaleMin = 1,
    scaleMax = 7,
    metric_type = "UNKNOWN"
  } = {}
) => {
  if (!vals || !vals.length) return null;

  const m = metric_form_general(vals, { scaleMin, scaleMax, metric_type });

  const fmt = (x: number) =>
    Number.isFinite(x) ? x.toFixed(decimals) + unit : "—";

  const pos =
    corner === "tr"
      ? { right: 8, top: 8 }
      : corner === "br"
      ? { right: 8, bottom: 8 }
      : corner === "tl"
      ? { left: 8, top: 8 }
      : { left: 8, bottom: 8 };

  const line = (idx: number, text: string) => ({
    type: "text",
    style: { text, fill: "#888", fontSize: 12, lineHeight: 18 },
    ...pos,
    top: "top" in pos ? (pos as any).top + idx * 18 : undefined,
    bottom: "bottom" in pos ? (pos as any).bottom + (3 - idx) * 18 : undefined
  });

  return {
    graphic: [
      line(0, `n ${m.count}`),
      line(1, `Mean ${fmt(m.mean)}`),
      line(2, `Median ${fmt(m.median)}`),
      line(3, `SD ${fmt(m.sd)}`),
      line(4, `IQR ${fmt(m.iqr)}`)
    ],
    stats: m
  };
};
