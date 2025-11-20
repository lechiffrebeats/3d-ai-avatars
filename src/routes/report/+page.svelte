<script lang="ts">
  import { _ } from "$lib/i18n";

  export let action = "?/report";
  let email = "";
  let category = "bug";
  let severity = "normal";
  let description = "";
  let steps = "";
  let file: File | null = null;
  let consent = false;

  const maxDesc = 1000;
  const maxSteps = 1200;
  let submitting = false;
  let ok = false;
  let err = "";

  $: buttonText = $_("feedback.button.submit");

  function left(s: string, max: number) {
    const n = max - s.length;
    return n < 0 ? 0 : n;
  }

  async function onSubmit(e: SubmitEvent) {
    e.preventDefault();
    err = "";
    ok = false;

    if (!description.trim()) {
      err = $_("feedback.error.noDescription");
      return;
    }
    if (!consent) {
      err = $_("feedback.error.noConsent");
      return;
    }

    submitting = true;
    const fd = new FormData();
    fd.set("email", email.trim());
    fd.set("category", category);
    fd.set("severity", severity);
    fd.set("description", description.slice(0, maxDesc));
    fd.set("steps", steps.slice(0, maxSteps));
    fd.set("userAgent", navigator.userAgent);
    fd.set("page", location.href);
    if (file) fd.set("attachment", file, file.name);

    const res = await fetch(action, { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));
    submitting = false;

    if (res.ok && (data?.success ?? true)) {
      ok = true;
      email = "";
      description = "";
      steps = "";
      file = null;
      consent = false;
      buttonText = $_("feedback.button.success");
      setTimeout(() => (buttonText = $_("feedback.button.submit")), 2000);
    } else {
      err = data?.error || $_("feedback.error.sendFail");
    }
  }
</script>

<svelte:head>
  <title>{$_("feedback.meta.title")}</title>
  <meta name="description" content={$_("feedback.meta.description")} />
</svelte:head>

<section class="page">
  <div class="card">
    <h1>{$_("feedback.h1")}</h1>
    <p class="lead">{$_("feedback.lead")}</p>

    {#if ok}
      <div class="alert ok" role="status" aria-live="polite">
        {$_("feedback.success")}
      </div>
    {/if}
    {#if err}
      <div class="alert err" role="alert">{err}</div>
    {/if}

    <form class="form" on:submit={onSubmit} aria-describedby="hint">
      <div class="row">
        <label for="category">{$_("feedback.fields.category.label")}</label>
        <select id="category" bind:value={category} required>
          <option value="bug"
            >{$_("feedback.fields.category.options.bug")}</option
          >
          <option value="idea"
            >{$_("feedback.fields.category.options.idea")}</option
          >
          <option value="content"
            >{$_("feedback.fields.category.options.content")}</option
          >
          <option value="other"
            >{$_("feedback.fields.category.options.other")}</option
          >
        </select>
      </div>

      <div class="row">
        <label for="severity">{$_("feedback.fields.severity.label")}</label>
        <div class="seg">
          <label class="segitem">
            <input
              type="radio"
              name="severity"
              value="low"
              bind:group={severity}
            />
            {$_("feedback.fields.severity.low")}
          </label>
          <label class="segitem">
            <input
              type="radio"
              name="severity"
              value="normal"
              bind:group={severity}
            />
            {$_("feedback.fields.severity.normal")}
          </label>
          <label class="segitem">
            <input
              type="radio"
              name="severity"
              value="high"
              bind:group={severity}
            />
            {$_("feedback.fields.severity.high")}
          </label>
        </div>
      </div>

      <div class="row">
        <label for="description">
          {$_("feedback.fields.description.label")}
          <span class="muted"
            >({$_("feedback.fields.description.max", { n: maxDesc })})</span
          >
        </label>
        <textarea
          id="description"
          bind:value={description}
          maxlength={maxDesc}
          rows="6"
          placeholder={$_("feedback.fields.description.placeholder")}
          required
        ></textarea>
        <div class="count">{left(description, maxDesc)}</div>
      </div>

      <div class="row">
        <label for="steps">
          {$_("feedback.fields.steps.label")}
          <span class="muted">({$_("feedback.fields.steps.optional")})</span>
        </label>
        <textarea
          id="steps"
          bind:value={steps}
          maxlength={maxSteps}
          rows="5"
          placeholder={$_("feedback.fields.steps.placeholder")}
        ></textarea>
        <div class="count">{left(steps, maxSteps)}</div>
      </div>

      <div class="row">
        <label for="email">{$_("feedback.fields.email.label")}</label>
        <input
          id="email"
          type="email"
          inputmode="email"
          autocomplete="email"
          placeholder={$_("feedback.fields.email.placeholder")}
          bind:value={email}
        />
      </div>

      <div class="row check">
        <label class="checklabel">
          <input type="checkbox" bind:checked={consent} />
          {$_("feedback.fields.consent")}
        </label>
      </div>

      <div id="hint" class="hint">{$_("feedback.hint")}</div>

      <div class="actions">
        <button
          class="btn send"
          type="submit"
          disabled={submitting || !description.trim() || !consent}
        >
          {#if submitting}
            {$_("feedback.button.sending")}
          {:else}
            {buttonText}
          {/if}
        </button>
      </div>
    </form>
  </div>
</section>

<style>
  :root {
    --card: #ffffff;
    --fg: #0f172a;
    --muted: #64748b;
    --border: #e2e8f0;
    --primary: #ff6a00;
    --ok: #16a34a;
    --err: #b91c1c;
  }
  .page {
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: 0;
    place-items: center;
    padding: 24px;
  }
  .card {
    width: 100%;
    max-width: 780px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 6px 24px rgba(15, 23, 42, 0.06);
  }
  h1 {
    margin: 0 0 4px;
    font-size: clamp(1.6rem, 3vw, 2.1rem);
  }
  .lead {
    margin: 0 0 14px;
    color: var(--muted);
  }
  .form {
    display: grid;
    gap: 14px;
  }
  .row {
    display: grid;
    gap: 6px;
  }
  label {
    font-weight: 600;
  }
  .muted {
    color: var(--muted);
    font-weight: 400;
  }
  input[type="email"],
  select,
  textarea {
    width: 100%;
    border: 1px solid var(--border);
    background: #fff;
    padding: 12px 14px;
    border-radius: 12px;
    font: inherit;
    box-sizing: border-box;
    outline: none;
  }
  textarea {
    resize: vertical;
  }
  input:focus,
  select:focus,
  textarea:focus {
    border-color: #cbd5e1;
    box-shadow: 0 0 0 4px rgba(100, 116, 139, 0.12);
  }
  .seg {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .segitem {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border: 1px solid var(--border);
    border-radius: 999px;
    background: #fff;
  }
  .count {
    justify-self: end;
    font-size: 0.85rem;
    color: var(--muted);
  }
  .check {
    margin-top: 2px;
  }
  .checklabel {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 500;
  }
  .hint {
    font-size: 0.9rem;
    color: var(--muted);
  }
  .actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 6px;
  }
  .btn {
    appearance: none;
    border: 0;
    border-radius: 999px;
    background: var(--primary);
    color: #fff;
    font-weight: 700;
    padding: 10px 18px;
    cursor: pointer;
    transition:
      transform 0.05s ease,
      box-shadow 0.2s ease;
  }
  .btn:hover {
    box-shadow: 0 6px 18px rgba(255, 106, 0, 0.25);
  }
  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
  }
  .alert {
    border-radius: 12px;
    padding: 10px 12px;
    border: 1px solid;
    font-weight: 600;
    margin: 4px 0;
  }
  .alert.ok {
    color: var(--ok);
    border-color: rgba(22, 163, 74, 0.25);
    background: rgba(22, 163, 74, 0.08);
  }
  .alert.err {
    color: var(--err);
    border-color: rgba(185, 28, 28, 0.25);
    background: rgba(185, 28, 28, 0.08);
  }
</style>
