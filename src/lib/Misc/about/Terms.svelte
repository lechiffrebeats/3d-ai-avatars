<script lang="ts">
  import { _ } from "$lib/i18n";
  import { page } from "$app/stores";

  let t: (k: string, o?: any) => string = (k) => k;
  $: t = $_;

  $: currentLang = $page.url.searchParams.get("lang") || null;
  function withLang(path: string) {
    const u = new URL(path, $page.url);
    if (currentLang) u.searchParams.set("lang", currentLang);
    const qs = u.searchParams.toString();
    return u.pathname + (qs ? `?${qs}` : "");
  }

  $: localeTag = currentLang === "de" ? "de-DE" : "en-US";
  $: asOf = new Intl.DateTimeFormat(localeTag).format(new Date());

  $: minAge = t("legal.terms.minAge");
</script>

<svelte:head>
  <title>{t("legal.terms.head.title")}</title>
  <meta
    name="description"
    content={t("legal.terms.head.description", { values: { age: minAge } })}
  />
</svelte:head>

<section class="legal">
  <h1>{t("legal.terms.h1")}</h1>
  <small class="muted">{t("legal.terms.badge")}</small>

  <h2>{t("legal.terms.projectTitle")}</h2>
  <p>{t("legal.terms.projectText")}</p>

  <h2>{t("legal.terms.allowedTitle")}</h2>
  <ul>
    <li>{@html t("legal.terms.allowed.p1")}</li>
    <li>{t("legal.terms.allowed.p2")}</li>
    <li>{t("legal.terms.allowed.minAge", { values: { age: minAge } })}</li>
  </ul>

  <h2>{t("legal.terms.disclaimerTitle")}</h2>
  <p>{t("legal.terms.disclaimerText")}</p>

  <h2>{t("legal.terms.ossTitle")}</h2>
  <p>{t("legal.terms.ossText")}</p>

  <h2>{t("legal.terms.changesTitle")}</h2>
  <p>{t("legal.terms.changesText")}</p>

  <h2>{t("legal.terms.lawTitle")}</h2>
  <p>{t("legal.terms.lawText")}</p>

  <p class="stand">{t("legal.terms.asOf", { values: { date: asOf } })}</p>
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
  h2 {
    font-weight: 600;
  }
  .stand {
    color: #6b7280;
    margin-top: 1rem;
  }
</style>
