<script lang="ts">
  import { goto } from "$app/navigation";
  import compodia from "$lib/images/about/comp.png";
  import Techstack from "$lib/Misc/Other/Techstack.svelte";
  import { _ } from "$lib/i18n";
  import { page } from "$app/state";
  import { backgrounds } from "$lib/Agent/Avatar";

  let t: (k: string, o?: any) => string = (k) => k;
  $: t = $_;

  const links = [
    {
      labelKey: "aboutpage.links.test",
      href: "/evaluation",
      kind: "ghost",
      disabled: false,
    },
    {
      labelKey: "aboutpage.links.docu",
      href: "/about",
      kind: "ghost",
      disabled: true,
    },
    {
      labelKey: "aboutpage.links.code",
      href: "/about",
      kind: "ghost",
      disabled: true,
    },
  ];

  $: currentLang = page.url.searchParams.get("lang") || null;
  function withLang(path: string) {
    const u = new URL(path, page.url);
    if (currentLang) u.searchParams.set("lang", currentLang);
    const qs = u.searchParams.toString();
    return u.pathname + (qs ? `?${qs}` : "");
  }
  function gotoLang(path: string) {
    return goto(withLang(path));
  }

  $: email = t("aboutpage.hero.email");
  $: univ = t("aboutpage.hero.hochschule");
  $: date = t("aboutpage.hero.date");

  $: tag =
    t("aboutpage.hero.tag", { values: { univ, date } }) || `${univ} · ${date}`;
</script>

<svelte:head>
  <title>{t("aboutpage.meta.title")}</title>
  <meta name="description" content={t("aboutpage.meta.description")} />
</svelte:head>

<section class="page">
  <header class="hero">
    <h1>{t("aboutpage.hero.h1")}</h1>
    <p class="tag">{tag}</p>

    {#if t("aboutpage.hero.title")}
      <p class="title">{t("aboutpage.hero.title")}</p>
    {/if}

    <div class="byline">
      <span>{t("aboutpage.hero.author")}: {t("aboutpage.hero.autor")}</span>
      <span>·</span>
      <span>{t("aboutpage.hero.studiengang")}</span>
      <span>·</span>
      <!-- primary advisor -->
      <a class="link" href={"mailto:" + email}>{email}</a>
    </div>

    <div class="actions">
      {#each links as l}
        <button
          style="cursor:{l.disabled ? 'not-allowed' : 'pointer'};"
          class="btn {l.kind}"
          aria-disabled={l.disabled}
          disabled={l.disabled}
          on:click={() => goto(l.href)}
        >
          {t(l.labelKey)}
        </button>
      {/each}
    </div>
  </header>

  <div class="grid">
    <article class="card">
      <h2>{t("aboutpage.abstract.title")}</h2>
      <p>{@html t("aboutpage.abstract.body")}</p>
    </article>

    <article class="card">
      <h2>{t("aboutpage.short.title")}</h2>
      <ul class="bullets">
        <li>{@html t("aboutpage.short.domain")}</li>
        <li>{@html t("aboutpage.short.modes")}</li>
        <li>{@html t("aboutpage.short.goals")}</li>
        <li>{@html t("aboutpage.short.privacy")}</li>
        <li>{@html t("aboutpage.short.publication")}</li>
      </ul>
    </article>

    <article class="card">
      <h2>{t("aboutpage.components.title")}</h2>
      <ol class="num">
        <img src={compodia} class="compodia" alt="" />
      </ol>
      <Techstack />
    </article>

    <article class="card">
      <h2>{t("aboutpage.research.title")}</h2>
      <ol class="num">
        <li>{@html t("aboutpage.research.q1")}</li>
        <li>{@html t("aboutpage.research.q2")}</li>
        <li>{@html t("aboutpage.research.q3")}</li>
        <li>{@html t("aboutpage.research.q4")}</li>
        <li>{@html t("aboutpage.research.q5")}</li>
      </ol>
    </article>

    <article class="card">
      <h2>{t("aboutpage.method.title")}</h2>
      <p>
        {@html t("aboutpage.method.body")}
        <br />
        <button class="gotobutton" on:click={() => gotoLang("/evaluation")}>
          {t("aboutpage.method.button")}
        </button>
        <button class="gotobutton" on:click={() => gotoLang("/Results")}>
          {t("aboutpage.method.buttonResults")}
        </button>
      </p>
    </article>

    <article class="card">
      <h2>{t("aboutpage.contact.title")}</h2>
      <p>
        <strong>{t("aboutpage.meta.autor")}</strong><br />
        {univ} · {t("aboutpage.meta.studiengang")}<br />
        <a class="link" href={"mailto:" + email}>{email}</a><br />
        <a class="link" href="mailto:chillwatchstudios@gmail.com">
          chillwatchstudios@gmail.com
        </a><br />
      </p>
    </article>

    <article class="card">
      <h2>{t("aboutpage.background.title")}</h2>
      {#each Object.values(backgrounds) as bgs}
        {#each bgs as b}
          <div class="quote">
            <p>{b.authorName}</p>
            <small> <a target="_blank" href={b.author}> {b.author}</a></small>
            <small>
              <a class="link" target="_blank" href={b.src}> {b.src}</a></small
            >
          </div>
        {/each}
      {/each}
    </article>
  </div>
</section>

<style>
  .page {
    overflow-x: hidden;
    padding-bottom: max(24px, env(safe-area-inset-bottom));
    padding-top: max(24px, env(safe-area-inset-top));
  }
  a,
  .quote,
  .card,
  p,
  li {
    overflow-wrap: anywhere;
    word-break: break-word;
  }
  img,
  .compodia {
    max-width: 100%;
    height: auto;
    display: block;
  }

  @media (max-width: 640px) {
    .page {
      padding: 16px;
    }
    .hero {
      gap: 0.6rem;
      margin-bottom: 0.9rem;
    }
    .byline {
      font-size: 0.9rem;
    }
    h1 {
      font-size: clamp(1.4rem, 6vw, 1.9rem);
    }
    .title {
      font-size: clamp(1rem, 4.5vw, 1.2rem);
    }
    .actions {
      gap: 0.4rem;
    }
    .btn {
      padding: 0.5rem 0.9rem;
      font-size: 0.95rem;
    }
    .grid {
      grid-template-columns: 1fr;
      gap: 0.75rem;
    }
    .card {
      padding: 14px;
    }
    .quote small a {
      display: inline-block;
      max-width: 100%;
    }
  }

  @media (min-width: 641px) and (max-width: 859px) {
    .page {
      padding: 20px;
    }
    .grid {
      gap: 0.85rem;
    }
  }
  .compodia {
    width: 100%;
  }

  .gotobutton {
    margin-top: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 22px;
    border: 0.2px solid rgb(41, 41, 41);
    background: #ff6a00;
    color: white;
    font-weight: 600;
    cursor: pointer;
  }

  .gotobutton:hover {
    transform: scale(1.04);
    transition: transform 0.2s ease-in-out;
  }

  .page {
    --fg: #0f172a;
    --muted: #475569;
    --border: #e2e8f0;
    --card: #ffffff;
    --primary: #ff6a00;
    max-width: 1100px;
    margin: 0 auto;
    padding: 24px;
    background: var(--bg);
    color: var(--fg);
  }
  .hero {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
  }
  .tag {
    margin: 0;
    padding: 0;
    font-size: 0.95rem;
    color: var(--muted);
  }
  .title {
    font-size: clamp(1.1rem, 2.2vw, 1.4rem);
    font-weight: 600;
    line-height: 1.45;
    margin-top: 0;
    padding: 0;
    color: var(--fg);
  }
  h1 {
    font-size: clamp(1.6rem, 3vw, 2.2rem);
    margin: 0 0 0.25rem 0;
  }
  h2 {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
  }
  .byline {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    color: var(--muted);
    font-size: 0.95rem;
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.25rem;
  }
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1rem;
    border-radius: 999px;
    border: 1px solid var(--border);
    text-decoration: none;
    font-weight: 600;
  }
  .btn:hover {
    border: 1px solid rgb(50, 50, 50);
  }
  .btn.primary {
    background: var(--primary);
    color: #fff;
    border-color: transparent;
  }
  .btn.ghost {
    background: #fff;
    color: var(--fg);
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.9rem;
    margin-top: 0.5rem;
  }
  @media (min-width: 860px) {
    .grid {
      grid-template-columns: 1fr 1fr;
    }
  }
  .card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 16px;
  }
  .bullets {
    margin: 0;
    padding-left: 1.1rem;
    display: grid;
    gap: 0.35rem;
  }
  .num {
    margin: 0;
    padding-left: 1.25rem;
    display: grid;
    gap: 0.35rem;
  }
  .toc {
    margin: 0;
    padding-left: 1.1rem;
    display: grid;
    gap: 0.15rem;
    color: var(--muted);
  }
  p {
    margin: 0.25rem 0 0.5rem 0;
    line-height: 1.6;
  }
  .link {
    color: var(--primary);
    text-decoration: none;
  }
  .link:hover {
    text-decoration: underline;
  }
</style>
