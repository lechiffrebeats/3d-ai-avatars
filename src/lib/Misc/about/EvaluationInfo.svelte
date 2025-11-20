<script lang="ts">
  import CopySessionId from "$lib/Evaluation/Misc/CopySessionId.svelte";
  import OrangeBall from "$lib/Evaluation/Misc/OrangeBall.svelte";
  import { _ } from "$lib/i18n";
  import { locale } from "@rgglez/svelte-i18n";

  let t: (k: string, o?: any) => string = (k) => k;
  $: t = $_;

  $: localeTag = $locale === "de" ? "de-DE" : "en-US";
  $: asOf = new Intl.DateTimeFormat(localeTag).format(new Date());

  const rows = [
    "Zweck",
    "Daten",
    "DatenSend",
    "Speicherdauer",
    "DatenLoeschen",
    "Hinsweis",
    "KeinePersonen",
    "Fehlerhinweis",
    "Site",
    "desktop",
    "sound",
    "dauer",
  ];
</script>

<svelte:head>
  <title>{t("legal.evalinfo.head.title")}</title>
  <meta name="description" content={t("legal.evalinfo.head.description")} />
</svelte:head>

<section class="legal">
  <h1>{t("legal.evalinfo.title")}</h1>

  <div class="table">
    <div class="thead">
      <div>{t("legal.evalinfo.table.head.point")}</div>
      <div>{t("legal.evalinfo.table.head.desc")}</div>
    </div>

    {#each rows as id}
      {#if id === "Daten"}
        <div class="trow">
          <div><code>{id}</code></div>
          <div>
            {@html t("legal.evalinfo.rows.Daten.before")}
            <a
              href="https://docs.aws.amazon.com/de_de/AWSEC2/latest/UserGuide/using-regions-availability-zones.html"
              target="_blank"
              rel="noopener noreferrer"
              style="color:rgb(244,98,0);"
              >{t("legal.evalinfo.rows.Daten.awsRegion")}</a
            >
            {t("legal.evalinfo.rows.Daten.after")}
          </div>
        </div>
      {:else if id === "DatenLoeschen"}
        <div class="trow">
          <div><code>{id}</code></div>
          <div>
            {t("legal.evalinfo.rows.DatenLoeschen.beforeEmail")}{" "}
            <a
              href="mailto:chillwatchstudios@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              style="color:rgb(244,98,0);">chillwatchstudios@gmail.com</a
            >
            {" "}
            {t("legal.evalinfo.rows.DatenLoeschen.afterEmailPrefix")}
            <CopySessionId />
            {t("legal.evalinfo.rows.DatenLoeschen.afterEmailSuffix")}
          </div>
        </div>
      {:else if id === "Hinsweis"}
        <div class="trow">
          <div><code>{id}</code></div>
          <div>
            {t("legal.evalinfo.rows.Hinsweis.before")}
            <OrangeBall />
            {t("legal.evalinfo.rows.Hinsweis.after")}
          </div>
        </div>
      {:else}
        <div class="trow">
          <div><code>{id}</code></div>
          <div>{t(`legal.evalinfo.rows.${id}`)}</div>
        </div>
      {/if}
    {/each}
  </div>

  <p class="stand">{t("legal.evalinfo.asOf", { values: { date: asOf } })}</p>
</section>

<style>
  .legal {
    max-width: 860px;
    margin: 0 auto;
    padding: 1rem;
    line-height: 1.6;
    color: white;
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
    grid-template-columns: 1.2fr 3fr;
    background: #fff;
    padding: 0.6rem;
    align-items: center;
    color: black;
  }
  .thead {
    font-weight: 600;
    background: #f9fafb;
  }
  h1 {
    color: #525252;
    margin-top: 1rem;
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
  .logo {
    width: 100px;
    height: 120px;
    margin-bottom: 1rem;
  }
</style>
