export const mapAnswerToNumber = (answer: any): number | null => {
  if (answer === "CORRECT" || answer === 1 || answer === true) return 1;
  if (answer === "INCORRECT" || answer === 0 || answer === false) return 0;
  return null;
};

/* canonical task keys (A/B map to the same concept) */
const CANON_KEY: Record<string, string> = {
  "avatar-task-ws-deadline-v1": "deadline",
  "text-task-ss-deadline-v1": "deadline",
  "avatar-task-thesis-cp-v1": "credits",
  "text-task-master-total-cp-v1": "credits",
  "avatar-task-msc-eligibility-test-v1": "requirements",
  "text-task-ml-prereq-v1": "requirements",
  "avatar-free-interaction-v1": "free",
  "text-free-interaction-v1": "free",
};

export const getCanonKey = (id: string): string => CANON_KEY[id] ?? id;

/* pull per-session task data for A/B tracks and their correctness flags */
export const getTaskShitForUser = (allSessions: any, sessionId: string) => {
  const sid = sessionId;
  const filterOut = ["restOfData", "stable_key", "count", "taskCorrectness"];
  const safeEntries = (obj: any) => Object.entries(obj ?? {});

  const taskData_a = safeEntries(allSessions.tasks?.a_metrics).map(([name, stuff]: any) => {
    const userValues = safeEntries(stuff)
      .map(([MetricName, val]: any) => ({
        MetricName,
        ...(val?.values_x_session_id?.find((s: any) => s.session_id === sid) ?? {}),
      }))
      .filter((m: any) => !filterOut.includes(m.MetricName));
    return { name, userValues };
  });

  const taskData_b = safeEntries(allSessions.tasks?.b_metrics).map(([name, stuff]: any) => {
    const userValues = safeEntries(stuff)
      .map(([MetricName, val]: any) => ({
        MetricName,
        ...(val?.values_x_session_id?.find((s: any) => s.session_id === sid) ?? {}),
      }))
      .filter((m: any) => !filterOut.includes(m.MetricName));
    return { name, userValues };
  });

  const taskData_Correctness_a = safeEntries(allSessions.tasks?.a_metrics).map(([name, stuff]: any) => {
    const m = safeEntries(stuff)
      .map(([MetricName, val]: any) => ({
        MetricName,
        ...(val?.values_x_session_id?.find((s: any) => s.session_id === sid) ?? {}),
      }))
      .find((x: any) => x.MetricName === "taskCorrectness");
    const ans = mapAnswerToNumber(m?.answer);
    return { name, equiv_Id: getCanonKey(name), answer: ans };
  });

  const taskData_Correctness_b = safeEntries(allSessions.tasks?.b_metrics).map(([name, stuff]: any) => {
    const m = safeEntries(stuff)
      .map(([MetricName, val]: any) => ({
        MetricName,
        ...(val?.values_x_session_id?.find((s: any) => s.session_id === sid) ?? {}),
      }))
      .find((x: any) => x.MetricName === "taskCorrectness");
    const ans = mapAnswerToNumber(m?.answer);
    return { name, equiv_Id: getCanonKey(name), answer: ans };
  });

  const taskFreeData_a = safeEntries(allSessions.tasksFree?.a_metrics).map(([name, stuff]: any) => {
    const userValues = safeEntries(stuff)
      .map(([MetricName, val]: any) => ({
        MetricName,
        ...(val?.values_x_session_id?.find((s: any) => s.session_id === sid) ?? {}),
      }))
      .filter((m: any) => !filterOut.includes(m.MetricName));
    return { name, userValues };
  });

  const taskFreeData_b = safeEntries(allSessions.tasksFree?.b_metrics).map(([name, stuff]: any) => {
    const userValues = safeEntries(stuff)
      .map(([MetricName, val]: any) => ({
        MetricName,
        ...(val?.values_x_session_id?.find((s: any) => s.session_id === sid) ?? {}),
      }))
      .filter((m: any) => !filterOut.includes(m.MetricName));
    return { name, userValues };
  });

  return {
    taskData_a,
    taskData_b,
    taskFreeData_a,
    taskFreeData_b,
    taskData_Correctness_a,
    taskData_Correctness_b,
  };
};

/* variant ratings: return raw 1–7 Likerts; scaling is handled downstream */
export function getVariantRatings(allSessions: any, sid: string) {
  const rows = allSessions.variantRating?.by_session?.filter((s: any) => s.session_id === sid);
  const pick = (prefix: "avatar" | "text") =>
    rows
      ?.filter((s: any) => s?.data?.stable_key?.startsWith(prefix))
      .map((s: any) =>
        s.data?.eval_questions
          ?.map((ev: any) => ({ question_id: ev.id, answer: ev.answer }))
          ?.filter((e: any) => e.question_id?.split("_")[2] !== "note")
      )?.[0];

  return { variantRating_a: pick("avatar"), variantRating_b: pick("text") };
}

/* deltas for per-task ratings (1–7); returns raw Δ (A−B). scaling happens later */
export function makeTaskRatingDeltasByCanon(raw_a: any[] = [], raw_b: any[] = [], _isFree: boolean) {
  const mapB = new Map(raw_b.map((t) => [getCanonKey(t?.name), t]));
  const deltas: any[] = [];

  for (const aTask of raw_a) {
    const canon = getCanonKey(aTask?.name);
    const bTask = mapB.get(canon);
    if (!bTask) continue;

    const bByMetric = Object.fromEntries((bTask.userValues ?? []).map((u: any) => [u?.MetricName, Number(u?.answer)]));
    for (const a of aTask.userValues ?? []) {
      const A = Number(a?.answer);
      const B = bByMetric[a?.MetricName];
      if (Number.isFinite(A) && Number.isFinite(B)) {
        deltas.push({ metric: a?.MetricName, A, B, Δ_answer: A - B, canon });
      }
    }
  }
  return { direction: "HIGHER_POSITIVE_AVATAR", deltas };
}

export function mapGender(s: any): number | null {
  switch (String(s ?? "")) {
    case "male":
      return 1;
    case "female":
      return 2;
    case "diverse":
      return 3;
    case "no_answer":
    case "":
    default:
      return 0;
  }
}

export function mapStatus(s: any): number | null {
  switch (String(s ?? "")) {
    case "bachelor":
      return 1;
    case "master":
      return 2;
    case "doctoral":
      return 3;
    case "alumni":
      return 4;
    case "external":
      return 5;
    case "no_answer":
    case "":
    default:
      return 0;
  }
}

export function mapLangLevel(s: any): number | null {
  switch (String(s ?? "")) {
    case "B1_or_lower":
      return 1;
    case "B2":
      return 2;
    case "C1":
      return 3;
    case "C2":
      return 4;
    case "native":
      return 5;
    case "no_answer":
    case "":
    default:
      return 0;
  }
}

export function mapDevice(s: any): number | null {
  switch (String(s ?? "")) {
    case "desktop":
      return 1;
    case "laptop":
      return 2;
    case "tablet":
      return 3;
    case "smartphone":
      return 4;
    case "no_answer":
    case "":
    default:
      return 0;
  }
}
