<script lang="ts">
  import { session, setDateDMTask } from "../EvalSystem";
  import { _ } from "$lib/i18n";

  export let stepId: number;

  // current step (null-safe)
  $: st = $session?.steps?.[stepId];

  // read current answer (do NOT mutate $session directly)
  let d: number | string = "";
  let m: number | string = "";

  $: {
    const a = st?.answers?.task;
    d = typeof a?.user_day === "number" ? a.user_day : "";
    m = typeof a?.user_month === "number" ? a.user_month : "";
  }

  // ✅ capture translator at top level to avoid store_invalid_scoped_subscription
  let t: (k: string, opts?: any) => string = (k) => k;
  $: t = $_;

  const two = (n: number) => (n < 10 ? `0${n}` : String(n));

  // labels (prefer keys from UI, then legacy text, then defaults)
  $: dayLabel = (st?.ui as any)?.dayLabelKey
    ? t((st!.ui as any).dayLabelKey)
    : ((st as any)?.ui?.dayLabel ?? t("dateDM.day"));

  $: monthLabel = (st?.ui as any)?.monthLabelKey
    ? t((st!.ui as any).monthLabelKey)
    : ((st as any)?.ui?.monthLabel ?? t("dateDM.month"));

  $: monthNames = Array.from({ length: 12 }, (_, i) => {
    const k = two(i + 1);
    return { n: i + 1, label: t(`dateDM.months.${k}`) };
  });

  function update() {
    setDateDMTask(stepId, d, m);
  }

  const idBase = `date-dm-${Math.random().toString(36).slice(2)}`;
  const idDay = `${idBase}-day`;
  const idMonth = `${idBase}-month`;
</script>

<div class="date-dm">
  <label class="lab" for={idDay}>{dayLabel}</label>
  <select id={idDay} bind:value={d} on:change={update} aria-label={dayLabel}>
    <option value="" disabled hidden>{t("dateDM.placeholder")}</option>
    {#each Array.from({ length: 31 }, (_, i) => i + 1) as day}
      <option value={day}>{day}</option>
    {/each}
  </select>

  <label class="lab" for={idMonth}>{monthLabel}</label>
  <select
    id={idMonth}
    bind:value={m}
    on:change={update}
    aria-label={monthLabel}
  >
    <option value="" disabled hidden>{t("dateDM.placeholder")}</option>
    {#each monthNames as mo}
      <option value={mo.n}>{two(mo.n)} – {mo.label}</option>
    {/each}
  </select>
</div>

<style>
  .date-dm {
    display: grid;
    grid-template-columns: auto 1fr auto 1fr;
    gap: 8px;
    align-items: center;
  }
  .lab {
    font-weight: 600;
  }
  select {
    height: 40px;
    border-radius: 10px;
    border: 1px solid #ddd;
    background: #2f2f2f;
    color: #fff;
    padding: 0 0.6rem;
  }
</style>
