<script lang="ts">
  import { _ } from "$lib/i18n"; // your svelte-i18n wrapper
  import { page } from "$app/stores"; // NOT $app/state (deprecated)

  // translator capture (avoids scoped-subscription warnings)
  let t: (k: string, o?: any) => string = (k) => k;
  $: t = $_;

  // keep ?lang on internal links
  $: currentLang = $page.url.searchParams.get("lang") || null;
  function withLang(path: string) {
    const u = new URL(path, $page.url);
    if (currentLang) u.searchParams.set("lang", currentLang);
    const qs = u.searchParams.toString();
    return u.pathname + (qs ? `?${qs}` : "");
  }

  // localized “as of” date
  $: localeTag = currentLang === "de" ? "de-DE" : "en-US";
  $: asOf = new Intl.DateTimeFormat(localeTag).format(new Date());
</script>

<svelte:head>
  <title>{t("legal.impressum.head.title")}</title>
  <meta name="description" content={t("legal.impressum.head.description")} />
</svelte:head>

<section class="legal">
  <h1>{t("legal.impressum.h1")}</h1>
  <small class="muted">{t("legal.impressum.badge")}</small>

  <h2>{t("legal.impressum.providerTitle")}</h2>
  <p>
    <b>Ramón de Smit</b><br />
    Kiefernweg 15<br />
    27367 Sottrum, Deutschland
  </p>

  <p>
    <b>{t("legal.impressum.contactTitle")}:</b><br />
    <a href="mailto:chillwatchstudios@gmail.com">chillwatchstudios@gmail.com</a>
  </p>

  <p>
    <b>{t("legal.impressum.responsibleTitle")}</b>{t(
      "legal.impressum.responsibleSuffix"
    )}
  </p>

  <h2>{t("legal.impressum.projectTitle")}</h2>
  <p>{t("legal.impressum.projectText")}</p>

  <h2>{t("legal.impressum.liabilityTitle")}</h2>
  <p>{t("legal.impressum.liabilityP1")}</p>
  <p>
    {t("legal.impressum.liabilityP2.prefix")}
    <a href={withLang("/about?p=oss")}>{t("legal.impressum.ossLink")}</a>
  </p>

  <p class="stand">{t("legal.impressum.asOf", { values: { date: asOf } })}</p>
</section>

<style>
  .legal {
    max-width: 860px;
    margin: 0 auto;
    padding: 1rem;
    line-height: 1.6;
  }
  .muted {
    color: #6b7280;
  }
  .stand {
    color: #6b7280;
    margin-top: 1rem;
  }
  h2 {
    font-weight: 600;
  }
</style>
