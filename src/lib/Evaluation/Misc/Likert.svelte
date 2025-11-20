<script lang="ts">
  import { _ } from "$lib/i18n";
  import { missing_property, setLikertNew, session } from "../EvalSystem";

  export let stepId: number;
  export let qid: string;

  $: step = $session?.steps?.[stepId];
  $: q = step?.eval_questions?.find((x) => x.id === qid);

  let t: (k: string, opts?: any) => string = (k) => k;
  $: t = $_;

  const FALL_MIN = 1;
  const FALL_MAX = 7;

  $: min = typeof q?.min === "number" ? q!.min : FALL_MIN;
  $: max = typeof q?.max === "number" ? q!.max : FALL_MAX;
  $: answer = (typeof q?.answer === "number" ? q!.answer : null) as
    | number
    | null;

  $: groupName = `likert-${stepId}-${qid}`;
  let value: number | null = null;
  $: if (typeof answer === "number" && value !== answer) value = answer;
  $: ticks = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  $: isMissing = $missing_property?.id === qid;
  const errId = `err-${groupName}`;

  function onPick(v: number) {
    value = v;
    setLikertNew(stepId, qid, v);
    if ($missing_property?.id === qid) missing_property.set(null);
  }

  $: labelText = q?.labelKey ? t(q.labelKey) : q?.label;
  $: hintText = q?.hintKey ? t(q.hintKey) : q?.hint;

  $: leftText =
    q?.leftHint ??
    (q?.leftHintKey ? t(q.leftHintKey) : t("likert.default.left"));
  $: rightText =
    q?.rightHint ??
    (q?.rightHintKey ? t(q.rightHintKey) : t("likert.default.right"));

  $: errText = t("likert.error");
</script>

{#if q}
  <fieldset
    class="likert-fieldset"
    data-qid={qid}
    class:missing={isMissing}
    aria-invalid={isMissing}
    aria-errormessage={isMissing ? errId : undefined}
  >
    {#if labelText}<legend>{labelText}</legend>{/if}
    {#if hintText}<small class="hint">{hintText}</small>{/if}

    <div class="scale" role="radiogroup">
      {#each ticks as v, i}
        <label class="radio">
          <input
            type="radio"
            name={groupName}
            value={v}
            checked={value === v}
            on:change={() => onPick(v)}
            data-focus={i === 0}
            aria-checked={value === v}
          />
          {v}
        </label>
      {/each}
    </div>

    {#if !hintText}
      <small>{min} = {leftText} · {max} = {rightText}</small>
    {/if}
    {#if isMissing}
      <div id={errId} class="err">{errText}</div>
    {/if}
  </fieldset>
{:else}
  <div class="muted">{t("likert.notFound")}</div>
{/if}

<style>
  .likert-fieldset {
    border: 0;
    padding: 0;
    margin: 0.25rem 0;
    display: grid;
    gap: 0.25rem;
  }
  legend {
    font-weight: 600;
    margin-bottom: 0.25rem;
  }
  .scale {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-wrap: wrap;
  }
  .radio {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }
  small {
    color: #f4f4f4;
  }

  .missing {
    outline: 2px solid #ef4444;
    outline-offset: 4px;
    background: rgba(239, 68, 68, 0.06);
    border-radius: 10px;
  }
  .err {
    color: #ef4444;
    font-size: 0.9rem;
    margin-top: 0.25rem;
  }
</style>
