<script lang="ts">
  import { session } from "../EvalSystem";
  import { _ } from "$lib/i18n";

  // initialize questionary_demo once (write through the store)
  $: if (!$session.questionary_demo) {
    session.update((s) => ({
      ...s,
      questionary_demo: {
        demo_age: null,
        demo_gender: "",
        demo_status: "",
        demo_ai_experience: null,
        demo_lang_level: "",
        demo_device: "",
        demo_domain_familiarity: null,
      },
    }));
  }

  $: demo = $session.questionary_demo ?? {};

  function setDemo<K extends keyof typeof demo>(
    key: K,
    value: (typeof demo)[K]
  ) {
    session.update((s) => ({
      ...s,
      questionary_demo: { ...(s.questionary_demo ?? {}), [key]: value },
    }));
  }

  const scale7 = [1, 2, 3, 4, 5, 6, 7];

  const genderOpts = [
    { id: "male", labelKey: "demo.gender.opt.male" },
    { id: "female", labelKey: "demo.gender.opt.female" },
    { id: "diverse", labelKey: "demo.gender.opt.diverse" },
    { id: "no_answer", labelKey: "demo.shared.no_answer" },
  ];

  const statusOpts = [
    { id: "bachelor", labelKey: "demo.status.opt.bachelor" },
    { id: "master", labelKey: "demo.status.opt.master" },
    { id: "doctoral", labelKey: "demo.status.opt.doctoral" },
    { id: "alumni", labelKey: "demo.status.opt.alumni" },
    { id: "external", labelKey: "demo.status.opt.external" },
    { id: "no_answer", labelKey: "demo.shared.no_answer" },
  ];

  const langLevelOpts = [
    { id: "", labelKey: "demo.shared.placeholder" },
    { id: "native", labelKey: "demo.lang.opt.native" },
    { id: "C2", labelKey: "demo.lang.opt.C2" },
    { id: "C1", labelKey: "demo.lang.opt.C1" },
    { id: "B2", labelKey: "demo.lang.opt.B2" },
    { id: "B1_or_lower", labelKey: "demo.lang.opt.B1_or_lower" },
    { id: "no_answer", labelKey: "demo.shared.no_answer" },
  ];

  const deviceOpts = [
    { id: "desktop", labelKey: "demo.device.opt.desktop" },
    { id: "laptop", labelKey: "demo.device.opt.laptop" },
    { id: "tablet", labelKey: "demo.device.opt.tablet" },
    { id: "smartphone", labelKey: "demo.device.opt.smartphone" },
    { id: "no_answer", labelKey: "demo.shared.no_answer" },
  ];
</script>

<form class="study-intro">
  <h1>
    {$_(
      $session.steps[2]?.titleKey ??
        $session.steps[2]?.title ??
        "steps.demo.title"
    )}
  </h1>
  <h2>{$_("demo.subtitle")}</h2>

  <label>
    {$_("demo.age.label")}
    <input
      type="number"
      min="16"
      max="120"
      step="1"
      placeholder={$_("demo.age.placeholder")}
      value={demo.demo_age ?? ""}
      name="demo_age"
      on:input={(e) =>
        setDemo(
          "demo_age",
          (e.currentTarget as HTMLInputElement).value
            ? +(e.currentTarget as HTMLInputElement).value
            : null
        )}
    />
  </label>

  <label>
    {$_("demo.gender.label")}
    <select
      value={demo.demo_gender ?? ""}
      name="demo_gender"
      on:change={(e) =>
        setDemo("demo_gender", (e.currentTarget as HTMLSelectElement).value)}
    >
      <option value="" disabled selected hidden
        >{$_("demo.shared.placeholder")}</option
      >
      {#each genderOpts as opt}
        <option value={opt.id}>{$_(opt.labelKey)}</option>
      {/each}
    </select>
  </label>

  <label>
    {$_("demo.status.label")}
    <select
      value={demo.demo_status ?? ""}
      name="demo_status"
      on:change={(e) =>
        setDemo("demo_status", (e.currentTarget as HTMLSelectElement).value)}
    >
      <option value="" disabled selected hidden
        >{$_("demo.shared.placeholder")}</option
      >
      {#each statusOpts as opt}
        <option value={opt.id}>{$_(opt.labelKey)}</option>
      {/each}
    </select>
  </label>

  <fieldset>
    <legend>{$_("demo.ai.legend")}</legend>
    <div class="scale">
      {#each scale7 as v}
        <label class="radio">
          <input
            type="radio"
            value={v}
            name="demo_ai_experience"
            checked={demo.demo_ai_experience === v}
            on:change={() => setDemo("demo_ai_experience", v)}
          />
          {v}
        </label>
      {/each}
    </div>
    <small>{$_("demo.ai.hint")}</small>
  </fieldset>

  <label>
    {$_("demo.lang.label")}
    <select
      value={demo.demo_lang_level ?? ""}
      name="demo_lang_level"
      on:change={(e) =>
        setDemo(
          "demo_lang_level",
          (e.currentTarget as HTMLSelectElement).value
        )}
    >
      <option value="" disabled selected hidden
        >{$_("demo.shared.placeholder")}</option
      >
      {#each langLevelOpts.slice(1) as opt}
        <!-- skip the dummy first element -->
        <option value={opt.id}>{$_(opt.labelKey)}</option>
      {/each}
    </select>
  </label>

  <label>
    {$_("demo.device.label")}
    <select
      value={demo.demo_device ?? ""}
      name="demo_device"
      on:change={(e) =>
        setDemo("demo_device", (e.currentTarget as HTMLSelectElement).value)}
    >
      <option value="" disabled selected hidden
        >{$_("demo.shared.placeholder")}</option
      >
      {#each deviceOpts as opt}
        <option value={opt.id}>{$_(opt.labelKey)}</option>
      {/each}
    </select>
  </label>

  <fieldset>
    <legend>{$_("demo.domain.legend")}</legend>
    <div class="scale">
      {#each scale7 as v}
        <label class="radio">
          <input
            type="radio"
            value={v}
            name="demo_domain_familiarity"
            checked={demo.demo_domain_familiarity === v}
            on:change={() => setDemo("demo_domain_familiarity", v)}
          />
          {v}
        </label>
      {/each}
    </div>
    <small>{$_("demo.domain.hint")}</small>
  </fieldset>
</form>

<style>
  h1 {
    text-align: left;
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
    margin-top: 0;
    padding: 0;
  }

  .study-intro {
    display: flex;
    position: relative;
    color: white;
    align-items: flex-start;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    color: white;
  }
  h2 {
    margin: 0.5rem 0 0.25rem;
  }
  label {
    display: grid;
    gap: 0.25rem;
  }
  input[type="number"],
  select {
    padding: 0.5rem 0.6rem;
    border: 1px solid #ddd;
    border-radius: 10px;
  }
  fieldset {
    border: 0;
    padding: 0;
    margin: 0.25rem 0;
  }
  legend {
    font-weight: 600;
    margin-bottom: 0.25rem;
  }
  .scale {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
  .radio {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }
  small {
    color: #f4f4f4;
  }
</style>
