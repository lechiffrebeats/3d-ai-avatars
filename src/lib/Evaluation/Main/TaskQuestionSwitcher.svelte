<script lang="ts">
  import { session, setSelect, setText, type Step } from "../EvalSystem";
  import DateDm from "../Misc/DateDM.svelte";
  import { _ } from "$lib/i18n";

  export let step: Step;
  const qid = "task";

  $: stepIndex =
    typeof step?.step_id === "number" ? step.step_id : $session.currStep;

  $: st = $session.steps?.[stepIndex];
  $: ans = st?.answers?.[qid] ?? {};
  let t: (k: string, o?: any) => string = (k) => k;
  $: t = $_;

  $: baseOptKey =
    step?.taskKey && step.taskKey.endsWith(".task")
      ? step.taskKey.replace(/\.task$/, ".opt.")
      : undefined;

  type UiOpt = { id: string; label?: string; labelKey?: string };
  $: rawOpts = step?.ui?.type === "select" ? (step?.ui?.options ?? []) : [];

  $: resolvedOpts = rawOpts.map((opt) => {
    const keyFromBase = baseOptKey ? `${baseOptKey}${opt.id}` : undefined;
    const labelText =
      (opt.labelKey ? t(opt.labelKey) : undefined) ??
      (keyFromBase ? t(keyFromBase) : undefined) ??
      opt.label ??
      opt.id;
    return { ...opt, labelText };
  });

  function onSelect(e: Event) {
    const v = (e.target as HTMLSelectElement).value;
    setSelect(stepIndex, qid, v);
  }
</script>

<div class="aufgabe-card">
  <header class="header">
    <p class="subtitle">{$_("taskinput.subtitle")}</p>
  </header>

  <div class="bodypat">
    {#if step.ui?.type === "number"}
      <div class="row">
        <input
          type="number"
          inputmode="numeric"
          placeholder={step.ui.suffix
            ? $_("taskinput.number.placeholderWithSuffix", {
                values: { suffix: step.ui.suffix },
              })
            : $_("taskinput.number.placeholder")}
          value={ans.user_text || ""}
          on:input={(e) =>
            setText(stepIndex, qid, (e.target as HTMLInputElement).value)}
        />
        {#if step.ui.suffix}<span class="suffix">{step.ui.suffix}</span>{/if}
      </div>
    {:else if step.ui?.type === "email"}
      <input
        type="email"
        placeholder={$_("taskinput.email.placeholder")}
        value={ans.user_text || ""}
        on:input={(e) =>
          setText(stepIndex, qid, (e.target as HTMLInputElement).value)}
      />
    {:else if step.ui?.type === "select"}
      <select
        value={typeof ans.user_select === "string" ? ans.user_select : ""}
        on:change={onSelect}
        required
      >
        <option value="" disabled selected={!ans.user_select}>
          {$_("taskinput.select.placeholder")}
        </option>
        {#each resolvedOpts as opt}
          <option value={opt.id}>{opt.labelText}</option>
        {/each}
      </select>
    {:else if step.ui?.type === "text"}
      <input
        type="text"
        placeholder={step.ui?.placeholder || $_("taskinput.text.placeholder")}
        value={ans.user_text || ""}
        on:input={(e) =>
          setText(stepIndex, qid, (e.target as HTMLInputElement).value)}
      />
    {:else if step.ui?.type === "date_dm"}
      <DateDm stepId={stepIndex} />
    {/if}
  </div>
</div>

<style>
  .bodypat {
    padding: 1rem;
  }

  .row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .row > input {
    flex: 1;
  }
  .suffix {
    opacity: 0.8;
  }
  input,
  select {
    width: 100%;
    padding: 0.55rem 0.6rem;

    box-sizing: border-box;
    border: 1px solid #ddd;
    border-radius: 10px;
    background: #fff;
  }

  /* NEWUEWHUEWUEWUEWU */

  .aufgabe-card {
    width: 100%;
    background: #333333;
    color: white;
    border: white 1px solid;
    border-radius: 12px;
    background: #3a3a3a;
    color: white;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .header {
    background: #ff5e00;
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  }

  .subtitle {
    margin: 0;
    font-weight: 600;
    font-size: 0.95rem;
  }
</style>
