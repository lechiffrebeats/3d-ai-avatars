<script lang="ts">
  import { _ } from "$lib/i18n";
  import Likert from "../Misc/Likert.svelte";
  import { session, missing_property } from "../EvalSystem";

  export let stepId: number;
  export let questionID: string;

  $: step = $session?.steps?.[stepId];
  $: q = step?.eval_questions?.find((x) => x.id === questionID);

  let t: (k: string, o?: any) => string = (k) => k;
  $: t = $_;

  $: labelText = q?.labelKey ? t(q.labelKey) : q?.label;
  $: hintText = q?.hintKey ? t(q.hintKey) : q?.hint;

  $: isMissing = $missing_property?.id === (q?.id ?? questionID);

  const errId = `${stepId}-${questionID}-err`;

  function setAnswer(value: string | number | null) {
    session.update((s) => {
      const st = s?.steps?.[stepId];
      if (!st) return s;
      const item = st.eval_questions?.find((x) => x.id === questionID);
      if (!item) return s;
      (item as any).answer = value;
      return s;
    });
    if ($missing_property?.id === questionID) missing_property.set(null);
  }

  const uid = (suffix: string) => `${stepId}-${questionID}-${suffix}`;

  type UiOpt = { id: string; label?: string; labelKey?: string };
  $: rawOpts = Array.isArray(q?.options) ? (q!.options as UiOpt[]) : [];

  $: resolvedOpts = rawOpts.map((opt) => {
    const label = opt.labelKey ? t(opt.labelKey) : (opt.label ?? opt.id);
    return { ...opt, labelText: label };
  });

  $: placeholder = t("taskinput.select.placeholder");
  $: textPlaceholder = t("taskinput.text.placeholder");
</script>

<div
  class="aufgabe-card"
  data-qid={q?.id ?? questionID}
  class:missing={isMissing}
  aria-invalid={isMissing}
  aria-errormessage={isMissing ? errId : undefined}
>
  {#if q}
    {#if q.type === "likert"}
      <Likert {stepId} qid={q.id} />
    {:else if q.type === "text"}
      <div class="field">
        {#if labelText}<label class="label" for={uid("txt")}>{labelText}</label
          >{/if}
        {#if hintText}<span class="hint">{hintText}</span>{/if}
        <!-- svelte-ignore element_invalid_self_closing_tag -->
        <textarea
          id={uid("txt")}
          rows="3"
          value={(q.answer ?? "") as string}
          on:input={(e) => setAnswer((e.target as HTMLTextAreaElement).value)}
          placeholder={textPlaceholder}
          data-focus
        />
      </div>
      {#if isMissing}<div id={errId} class="err">{t("likert.error")}</div>{/if}
    {:else if q.type === "select"}
      <div class="field">
        {#if labelText}<label class="label" for={uid("sel")}>{labelText}</label
          >{/if}
        {#if hintText}<span class="hint">{hintText}</span>{/if}
        <select
          id={uid("sel")}
          class="select"
          value={(q.answer ?? "") as string}
          on:change={(e) => setAnswer((e.target as HTMLSelectElement).value)}
          required={q.required ?? false}
          data-focus
        >
          <option value="" disabled selected={!q.answer}>{placeholder}</option>
          {#each resolvedOpts as opt}
            <option value={opt.id}>{opt.labelText}</option>
          {/each}
        </select>
      </div>
      {#if isMissing}<div id={errId} class="err">{t("likert.error")}</div>{/if}
    {:else}
      <div class="muted">{t("likert.notFound")}</div>
    {/if}
  {:else}
    <div class="muted">{t("likert.notFound")}</div>
  {/if}
</div>

<style>
  .aufgabe-card {
    width: 100%;
    border-radius: 12px;
    background: #333333;
    color: #fff;
    border: 1px solid #ffffff;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 8px;
    box-sizing: border-box;
  }
  .field {
    display: grid;
    gap: 0.35rem;
  }
  .label {
    font-weight: 600;
    line-height: 1.2;
  }
  .hint {
    font-size: 12px;
    opacity: 0.8;
    margin-top: -2px;
  }
  textarea,
  .select {
    width: 100%;
    border-radius: 10px;
    border: 1px solid #ddd;
    background: #2f2f2f;
    color: #fff;
    padding: 0.55rem 0.6rem;
    outline: none;
    box-sizing: border-box;
    font-size: 14px;
  }
  textarea:focus,
  .select:focus {
    border-color: rgb(244, 98, 0);
  }
  .muted {
    opacity: 0.75;
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
