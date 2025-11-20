import { BIN_SIZE, COMP_TIME_SCALE_MS, getBinIndexKey } from "./HelpersCharts";
import { extract_number_from_time, formatMs, getSessionById, groupByProp, group_by_prop_and_transform_prop, group_by_prop_and_transform_prop_to_count, transformKV } from "./HelpersStatisitcs";

export const totalTimeSpendMS= (stats) => (stats?.all?.raw || []).reduce(
(sum, sess) =>
    sum +
    (sess?.steps || []).reduce((s, st) => s + (Number(st?.duration) || 0), 0),
    0
);

export const totalSessions = (stats) => (stats?.all?.raw || []).length
export function completionTimeSession(session) {
    const timings = Object.values(session?.timings);
    const total = timings.reduce((s: number, st) => s + (Number(st?.dur) || 0), 0);
    return total
}

/* das hier geht eig nicht aber egal */
export const times_to_completion_steps = (steps) => {
    const res = group_by_prop_and_transform_prop(steps, "duration")
    return res
}

export function utm_sources_data(metas) {
    const res = group_by_prop_and_transform_prop_to_count(metas, "utm_source")
    return res
}

export const times_to_completion_sessions = (sessions) => {
    const res = group_by_prop_and_transform_prop(sessions, "completion_time"/* , formatMs */)
    
    const moddedFirst = Object.entries(res).reduce((acc, d) => {
        const {index, binValue} = getBinIndexKey(d[0], COMP_TIME_SCALE_MS);
        /* if(binValue >= 7200000) console.log("session ", getSessionById(d[1][0]?.session_id), "index", index, "binValue", binValue); */
        (acc[binValue] ||= []).push(d);
        return acc;
    }, {});

    const sortbyTime = Object.entries(moddedFirst).sort((a, b) => a[0] - b[0])
    const modded = transformKV(Object.fromEntries(sortbyTime), (x) => String(x), (y) => y.length)
    
    return modded
}

export const date_to_hour_min_transformer =(x) => new Date(x).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
})

export const date_to_hour_transformer =(x) => new Date(x).toLocaleTimeString([], {
    hour: "2-digit",
})

export const times_of_completion_sessions = (sessions) => {
    const res = group_by_prop_and_transform_prop(sessions, "created_at", /* date_to_hour_transformer */);
    const sortbyTime = Object.entries(res).sort((a, b) => extract_number_from_time(a[0]) - extract_number_from_time(b[0]));
    const tocount = transformKV(
      Object.fromEntries(sortbyTime),
      (x) => String(x),
      (y) => y.length
    )
    return tocount
}