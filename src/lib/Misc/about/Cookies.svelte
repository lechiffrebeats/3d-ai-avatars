<script lang="ts">
  import { _ } from "$lib/i18n";
  import { page } from "$app/stores";
  import { consent, revokeConsent } from "$lib/Misc/Cookies/consent";

  let t: (k: string, o?: any) => string = (k) => k;
  $: t = $_;

  $: currentLang = $page.url.searchParams.get("lang") || null;
  $: localeTag = currentLang === "de" ? "de-DE" : "en-US";
  $: asOf = new Intl.DateTimeFormat(localeTag).format(new Date());

  let btnText: string;
  $: btnText = t("legal.cookies.actions.revoke");

  function onRevoke() {
    revokeConsent();
    btnText = t("legal.cookies.actions.revoked");
  }
</script>

<svelte:head>
  <title>{t("legal.cookies.head.title")}</title>
  <meta name="description" content={t("legal.cookies.head.description")} />
</svelte:head>

<section class="legal">
  <h1>{t("legal.cookies.h1")}</h1>
  <p>{@html t("legal.cookies.intro")}</p>

  <h2>{t("legal.cookies.table.title")}</h2>

  <div class="table">
    <div class="thead">
      <div>{t("legal.cookies.table.cols.name")}</div>
      <div>{t("legal.cookies.table.cols.purpose")}</div>
      <div>{t("legal.cookies.table.cols.storage")}</div>
      <div>{t("legal.cookies.table.cols.duration")}</div>
    </div>

    <div class="trow">
      <div><code>session_id</code></div>
      <div>{t("legal.cookies.rows.session_id.purpose")}</div>
      <div>{t("legal.cookies.rows.session_id.storage")}</div>
      <div>{t("legal.cookies.rows.session_id.duration")}</div>
    </div>

    <div class="trow">
      <div><code>consent_*</code></div>
      <div>{t("legal.cookies.rows.consent.purpose")}</div>
      <div>{t("legal.cookies.rows.consent.storage")}</div>
      <div>{t("legal.cookies.rows.consent.duration")}</div>
    </div>

    <div class="trow">
      <div><code>eval_state</code></div>
      <div>{t("legal.cookies.rows.eval_state.purpose")}</div>
      <div>{t("legal.cookies.rows.eval_state.storage")}</div>
      <div>{t("legal.cookies.rows.eval_state.duration")}</div>
    </div>

    <div class="trow">
      <div><code>Speed Insights</code></div>
      <div>{t("legal.cookies.rows.speed.purpose")}</div>
      <div>{@html t("legal.cookies.rows.speed.storage")}</div>
      <div>{t("legal.cookies.rows.speed.duration")}</div>
    </div>
  </div>

  <p>{t("legal.cookies.optin.note")}</p>

  <div>
    <h3>{t("legal.cookies.yourConsentTitle")}</h3>
    {#if $consent}
      {#each Object.entries($consent) as [key, val]}
        <div><code>{key}</code>: {val ? "✅" : "❌"}</div>
      {/each}
    {:else}
      <div>{t("legal.cookies.noConsentState")}</div>
    {/if}
  </div>

  <div>
    <h2>{t("legal.cookies.actions.title")}</h2>
    <button
      on:click={onRevoke}
      style="border-radius: 20px; padding: .5rem 1rem;"
    >
      {btnText}
    </button>
  </div>

  <p class="stand">{t("legal.cookies.asOf", { values: { date: asOf } })}</p>
</section>

<style>
  .legal {
    max-width: 860px;
    margin: 0 auto;
    padding: 1rem;
    line-height: 1.6;
  }
  .table {
    display: grid;
    gap: 2px;
    background: #e5e7eb;
    border-radius: 10px;
    overflow: hidden;
    margin-top: 0.5rem;
  }
  .thead,
  .trow {
    display: grid;
    grid-template-columns: 1.2fr 2fr 1.2fr 1fr;
    background: #fff;
    padding: 0.6rem;
    align-items: center;
  }
  .thead {
    font-weight: 600;
    background: #f9fafb;
  }
  h2 {
    font-weight: 600;
  }
  code {
    background: #f3f4f6;
    padding: 0.1rem 0.3rem;
    border-radius: 4px;
  }
  .stand {
    color: #6b7280;
    margin-top: 1rem;
  }
</style>
