<script lang="ts">
  import { _ } from "$lib/i18n";
  import { locale } from "@rgglez/svelte-i18n";

  let t: (k: string, o?: any) => string = (k) => k;
  $: t = $_;

  $: localeTag = $locale === "de" ? "de-DE" : "en-US";
  $: asOf = new Intl.DateTimeFormat(localeTag).format(new Date());
</script>

<svelte:head>
  <title>{t("legal.systempage.head.title")}</title>
  <meta name="description" content={t("legal.systempage.head.description")} />
</svelte:head>

<section class="legal">
  <h1>{t("legal.systempage.title")}</h1>
  <small class="muted">{t("legal.systempage.badge")}</small>

  <h2>{t("legal.systempage.browser.title")}</h2>
  <ul>
    <li>{@html t("legal.systempage.browser.item1")}</li>
    <li>{t("legal.systempage.browser.item2")}</li>
    <li>{t("legal.systempage.browser.item3")}</li>
    <li>{t("legal.systempage.browser.item4")}</li>
    <li>{t("legal.systempage.browser.item5")}</li>
  </ul>

  <h2>{t("legal.systempage.text.title")}</h2>
  <ul>
    <li>{t("legal.systempage.text.item1")}</li>
    <li>{t("legal.systempage.text.item2")}</li>
    <li>{t("legal.systempage.text.item3")}</li>
    <li>{t("legal.systempage.text.item4")}</li>
    <li>{t("legal.systempage.text.item5")}</li>
  </ul>

  <h2>{t("legal.systempage.avatarLow.title")}</h2>
  <ul>
    <li>{t("legal.systempage.avatarLow.item1")}</li>
    <li>{t("legal.systempage.avatarLow.item2")}</li>
    <li>{t("legal.systempage.avatarLow.item3")}</li>
    <li>{t("legal.systempage.avatarLow.item4")}</li>
  </ul>

  <h2>{t("legal.systempage.recommended.title")}</h2>
  <ul>
    <li>{t("legal.systempage.recommended.item1")}</li>
    <li>{t("legal.systempage.recommended.item2")}</li>
    <li>{t("legal.systempage.recommended.item3")}</li>
    <li>{t("legal.systempage.recommended.item4")}</li>
  </ul>

  <h2>{t("legal.systempage.unsupported.title")}</h2>
  <ul>
    <li>{t("legal.systempage.unsupported.item1")}</li>
    <li>{t("legal.systempage.unsupported.item2")}</li>
  </ul>

  <h2>{t("legal.systempage.floor.title")}</h2>
  <ul>
    <li>{t("legal.systempage.floor.item1")}</li>
    <li>{t("legal.systempage.floor.item2")}</li>
    <li>{t("legal.systempage.floor.item3")}</li>
    <li>{t("legal.systempage.floor.item4")}</li>
  </ul>

  <h2>{t("legal.systempage.notes.title")}</h2>
  <ul>
    <li>{t("legal.systempage.notes.item1")}</li>
    <li>{t("legal.systempage.notes.item2")}</li>
  </ul>

  <p class="stand">{t("legal.systempage.asOf", { values: { date: asOf } })}</p>
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
    margin-top: 1.25rem;
  }
  .stand {
    color: #6b7280;
    margin-top: 1rem;
  }
  ul {
    padding-left: 1.1rem;
  }
</style>
