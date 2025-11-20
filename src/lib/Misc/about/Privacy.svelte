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
</script>

<svelte:head>
  <title>{t("legal.privacy.head.title")}</title>
  <meta name="description" content={t("legal.privacy.head.description")} />
</svelte:head>

<section class="legal">
  <h1>{t("legal.privacy.h1")}</h1>
  <small class="muted">{t("legal.privacy.short")}</small>

  <h2>{t("legal.privacy.ctrlTitle")}</h2>
  <p>{@html t("legal.privacy.ctrlText")}</p>

  <h2>{t("legal.privacy.dsbTitle")}</h2>
  <p>{@html t("legal.privacy.dsbText")}</p>
  <p>
    <a
      href="https://www.uni-bremen.de/informations-und-serviceportal-zu-den-themen-datenschutzrecht-und-informationssicherheit/datenschutz/kontakt-zum-datenschutz-team"
      target="_blank"
      rel="noopener noreferrer">{t("legal.privacy.dsbLinkLabel")}</a
    >
    · <a href="mailto:datenschutz@uni-bremen.de">datenschutz@uni-bremen.de</a>
  </p>

  <h2>{t("legal.privacy.basesTitle")}</h2>
  <ul>
    <li>{@html t("legal.privacy.bases.ops")}</li>
    <li>{@html t("legal.privacy.bases.eval")}</li>
    <li>{@html t("legal.privacy.bases.analytics")}</li>
    <li>{@html t("legal.privacy.bases.research")}</li>
  </ul>

  <h2>{t("legal.privacy.catsTitle")}</h2>
  <ul>
    <li>{@html t("legal.privacy.cats.logs")}</li>
    <li>{@html t("legal.privacy.cats.session")}</li>
    <li>{@html t("legal.privacy.cats.evaluation")}</li>
    <li>{@html t("legal.privacy.cats.audio")}</li>
    <li>{@html t("legal.privacy.cats.speed")}</li>
  </ul>

  <h2>{t("legal.privacy.procTitle")}</h2>
  <ul>
    <li>Vercel ({t("legal.privacy.proc.vercel")})</li>
    <li>Cloudflare ({t("legal.privacy.proc.cloudflare")})</li>
    <li>Supabase ({t("legal.privacy.proc.supabase")})</li>
    <li>{@html t("legal.privacy.proc.uni")}</li>
    <li>GWDG ARCANA ({t("legal.privacy.proc.gwdg")})</li>
    <li>{@html t("legal.privacy.proc.speed")}</li>
  </ul>
  <p class="muted">{t("legal.privacy.proc.note")}</p>

  <h2>{t("legal.privacy.transferTitle")}</h2>
  <p>{@html t("legal.privacy.transferText")}</p>

  <h2>{t("legal.privacy.retTitle")}</h2>
  <p>{@html t("legal.privacy.retText")}</p>

  <h2>{t("legal.privacy.cookiesTitle")}</h2>
  <p>
    {@html t("legal.privacy.cookiesText")}&nbsp;
    <a href={withLang("/about?p=cookies")}>{t("legal.privacy.cookiesLink")}</a>.
  </p>

  <h2>{t("legal.privacy.siTitle")}</h2>
  <p>{@html t("legal.privacy.siText")}</p>

  <h2>{t("legal.privacy.analyticsTitle")}</h2>
  <p>{@html t("legal.privacy.analyticsText")}</p>

  <h2>{t("legal.privacy.volTitle")}</h2>
  <p>{@html t("legal.privacy.volText")}</p>

  <h2>{t("legal.privacy.rightsTitle")}</h2>
  <p>{t("legal.privacy.rightsText")}</p>

  <p class="stand">{t("legal.privacy.asOf", { values: { date: asOf } })}</p>
</section>

<style>
  .legal {
    max-width: 860px;
    margin: 0 auto;
    padding: 1rem;
    line-height: 1.6;
  }
  .muted,
  .stand {
    color: #6b7280;
  }
  h2 {
    font-weight: 600;
  }
  code {
    background: #f3f4f6;
    padding: 0.1rem 0.3rem;
    border-radius: 4px;
  }
</style>
