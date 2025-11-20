<script lang="ts">
  import { get } from "svelte/store";
  export let Dict: any = {};

  $: Obj = typeof Dict?.subscribe === "function" ? get(Dict) : Dict;

  const isObj = (v: any) => v && typeof v === "object" && !Array.isArray(v);
  const isNil = (v: any) => v === null || v === undefined;
  const isNum = (v: any) => typeof v === "number" && Number.isFinite(v);

  $: rows = Object.keys(Obj ?? {})
    .filter((k) => isObj(Obj[k]))
    .map((k) => ({ key: k, obj: Obj[k] }));

  $: allCols = Array.from(
    rows.reduce((acc, r) => {
      Object.keys(r.obj).forEach((k) => acc.add(k));
      return acc;
    }, new Set<string>())
  ).filter((ck) => rows.some((r) => !isNil(r.obj[ck])));

  const prefer = [
    "value",
    "mean",
    "median",
    "sd",
    "se",
    "ci95_low",
    "ci95_high",
    "ci95_moe",
    "tcrit95",
    "count",
    "min",
    "q1",
    "q3",
    "max",
    "range",
    "percent",
    "percent_ci95_low",
    "percent_ci95_high",
    "iqr",
    "variance",
    "sum",
  ];
  $: cols = [
    ...prefer.filter((p) => allCols.includes(p)),
    ...allCols.filter((c) => !prefer.includes(c)).sort(),
  ];

  const fmt = (val: any, key: string) => {
    if (isNil(val)) return "";
    if (isNum(val)) {
      if (key.startsWith("percent")) return `${val.toFixed(2)}%`;
      if (key === "count" || key === "sum") return Math.round(val);
      if (key === "tcrit95") return val.toFixed(3);
      return val.toFixed(2);
    }
    return String(val);
  };
</script>

<div class="wrap">
  <table class="kv">
    <thead>
      <tr>
        <th>Metric</th>
        {#each cols as c}<th>{c}</th>{/each}
      </tr>
    </thead>
    <tbody>
      {#each rows as r}
        {#if cols.some((ck) => !isNil(r.obj[ck]))}
          <tr>
            <td class="rowKey">{r.key}</td>
            {#each cols as ck}<td>{fmt(r.obj[ck], ck)}</td>{/each}
          </tr>
        {/if}
      {/each}
    </tbody>
  </table>
</div>

<style>
  .wrap {
    overflow: auto;
  }
  .kv {
    border-collapse: collapse;
    font:
      14px/1.35 system-ui,
      sans-serif;
    table-layout: fixed;
  }
  .kv thead th {
    position: sticky;
    top: 0;
    background: #f7f7f7;
    z-index: 1;
  }
  .kv th,
  .kv td {
    padding: 4px 6px;
    border-bottom: 1px solid #e5e5e5;
    text-align: left;
    vertical-align: top;
  }
  .kv tbody tr:nth-child(odd) td {
    background: #f6f6f6;
  }
  .rowKey {
    white-space: nowrap;
    font-weight: 600;
  }
</style>
