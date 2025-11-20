<script lang="ts">
  import { onMount } from "svelte";
  import { _ } from "@rgglez/svelte-i18n";

  type Row = {
    source: "npm" | "pip";
    pkg: string;
    version: string;
    license: string;
    repository?: string;
    publisher?: string;
    email?: string;
    path?: string;
  };

  let rows: Row[] = [];
  let filtered: Row[] = [];
  let q = "";
  let loading = true;
  let error: string | null = null;

  let sortKey: keyof Row = "pkg";
  let sortDir: "asc" | "desc" = "asc";

  onMount(async () => {
    try {
      const [npmRes, pipRes] = await Promise.allSettled([
        fetch("/licenses/npm-licenses.json", { cache: "no-store" }),
        fetch("/licenses/pip-licenses.json", { cache: "no-store" }),
      ]);

      const npmData =
        npmRes.status === "fulfilled" && npmRes.value.ok
          ? await npmRes.value.json()
          : null;

      const pipData =
        pipRes.status === "fulfilled" && pipRes.value.ok
          ? await pipRes.value.json()
          : null;

      const npmRows: Row[] = npmData
        ? Object.entries(npmData).map(([k, v]: [string, any]) => {
            const at = k.lastIndexOf("@");
            const version = at >= 0 ? k.slice(at + 1) : "";
            const pkg = at >= 0 ? k.slice(0, at) : k;
            return {
              source: "npm",
              pkg,
              version,
              license: String(v.licenses ?? v.license ?? "UNKNOWN"),
              repository: v.repository ?? v.url ?? "",
              publisher: v.publisher ?? "",
              email: v.email ?? "",
              path: v.path ?? "",
            };
          })
        : [];

      const pipRows: Row[] = Array.isArray(pipData)
        ? pipData.map((o: any) => ({
            source: "pip",
            pkg: String(o.Name ?? ""),
            version: String(o.Version ?? ""),
            license: String(o.License ?? "UNKNOWN"),
            repository: String(o.URL ?? ""),
            publisher: "",
            email: "",
            path: String(o.LicenseFile ?? ""),
          }))
        : [];

      rows = [...npmRows, ...pipRows];
      applyFilter();
    } catch (e: any) {
      error = String(e?.message ?? e);
    } finally {
      loading = false;
    }
  });

  function applyFilter() {
    const qq = q.trim().toLowerCase();
    filtered = rows
      .filter(
        (r) =>
          !qq ||
          r.pkg.toLowerCase().includes(qq) ||
          r.license.toLowerCase().includes(qq) ||
          (r.publisher ?? "").toLowerCase().includes(qq) ||
          (r.repository ?? "").toLowerCase().includes(qq) ||
          r.source.includes(qq)
      )
      .sort((a, b) => {
        const av = String(a[sortKey] ?? "");
        const bv = String(b[sortKey] ?? "");
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      });
  }

  $: applyFilter();

  function setSort(k: keyof Row) {
    if (sortKey === k) sortDir = sortDir === "asc" ? "desc" : "asc";
    else {
      sortKey = k;
      sortDir = "asc";
    }
  }

  function exportCSV() {
    const header = [
      "Source",
      "Package",
      "Version",
      "License",
      "Repository",
      "Publisher",
      "Email",
      "Path",
    ];
    const lines = [header.join(",")];
    for (const r of filtered) {
      const row = [
        r.source,
        r.pkg,
        r.version,
        r.license,
        r.repository ?? "",
        r.publisher ?? "",
        r.email ?? "",
        r.path ?? "",
      ].map(csvEscape);
      lines.push(row.join(","));
    }
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `licenses-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function csvEscape(s: string) {
    const needs = /[",\n]/.test(s);
    return needs ? `"${s.replace(/"/g, '""')}"` : s;
  }
</script>

<svelte:head>
  <title>Open-Source Lizenzen</title>
  <meta
    name="description"
    content="Liste der verwendeten npm-Pakete und Lizenzen"
  />
</svelte:head>

<section class="wrap">
  <h1>Lizenzen</h1>

  <div class="toolbar">
    <input
      class="search"
      placeholder="Suche nach Paket/License/Publisher..."
      bind:value={q}
      on:input={() => applyFilter()}
    />
    <div class="counts">{filtered.length}/{rows.length} Pakete</div>
    <button class="btn" on:click={exportCSV}>CSV exportieren</button>
  </div>

  {#if loading}
    <div class="muted">Lade npm-Lizenzen...</div>
  {:else if error}
    <div class="error">{error}<br /></div>
  {:else}
    <div class="tablewrap">
      <div class="table">
        <div class="thead">
          <div class="th clickable" on:click={() => setSort("pkg")}>
            Package {sortKey === "pkg" ? (sortDir === "asc" ? "▲" : "▼") : ""}
          </div>
          <div class="th clickable" on:click={() => setSort("version")}>
            Version {sortKey === "version"
              ? sortDir === "asc"
                ? "▲"
                : "▼"
              : ""}
          </div>
          <div class="th clickable" on:click={() => setSort("license")}>
            License {sortKey === "license"
              ? sortDir === "asc"
                ? "▲"
                : "▼"
              : ""}
          </div>
          <div class="th">Repository</div>
          <div class="th clickable" on:click={() => setSort("publisher")}>
            Publisher {sortKey === "publisher"
              ? sortDir === "asc"
                ? "▲"
                : "▼"
              : ""}
          </div>
          <div class="th">Email</div>
        </div>

        {#each filtered as r (r.pkg + "@" + r.version)}
          <div class="trow">
            <div class="td pkg">{r.pkg}</div>
            <div class="td">{r.version}</div>
            <div class="td lic">{r.license}</div>
            <div class="td repo">
              {#if r.repository}
                <a href={r.repository} target="_blank" rel="noopener noreferrer"
                  >Repo</a
                >
              {:else}
                <span class="muted">–</span>
              {/if}
            </div>
            <div class="td">{r.publisher || "–"}</div>
            <div class="td">{r.email || "–"}</div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</section>

<style>
  .wrap {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    max-width: 1200px;
    margin: 0 auto;
  }
  h1 {
    margin: 0 0 0.25rem 0;
  }
  .toolbar {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-wrap: wrap;
  }
  .search {
    flex: 1;
    min-width: 220px;
    padding: 0.55rem 0.7rem;
    border: 1px solid #ddd;
    border-radius: 10px;
    background: #fff;
  }
  .counts {
    color: #555;
    font-size: 0.95rem;
  }
  .btn {
    padding: 0.45rem 0.8rem;
    border: 1px solid #ddd;
    border-radius: 10px;
    background: #111;
    color: #fff;
    cursor: pointer;
  }
  .error {
    color: #a10000;
    background: #fff0f0;
    border: 1px solid #ffcccc;
    padding: 0.75rem;
    border-radius: 10px;
  }
  .muted {
    color: #666;
  }

  .tablewrap {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    border-radius: 12px;
    background: #eee;
  }
  .table {
    display: grid;
    gap: 2px;
    min-width: 900px;
  }
  .thead,
  .trow {
    display: grid;
    grid-template-columns: 2.4fr 0.8fr 1.1fr 1fr 1.2fr 1.2fr;
    background: #fff;
    align-items: center;
    padding: 0.55rem 0.6rem;
  }
  .thead {
    background: #fafafa;
    font-weight: 700;
  }
  .trow:nth-child(odd) {
    background: #fcfcfc;
  }

  .th.clickable {
    cursor: pointer;
    user-select: none;
  }
  .td.pkg {
    word-break: break-word;
  }
  .td.lic {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  }
  .td.repo a {
    text-decoration: none;
  }
  .td.repo a:hover {
    text-decoration: underline;
  }

  .thead,
  .trow {
    min-width: 0;
  }
  .trow > .td,
  .thead > .th {
    min-width: 0;
  }
  .td,
  .th {
    overflow-wrap: anywhere;
  }

  @media (max-width: 640px) {
    .wrap {
      padding: 0.75rem;
    }
    .toolbar {
      gap: 0.4rem;
    }
    .search {
      min-width: 0;
      flex: 1 1 auto;
    }
    .table {
      min-width: 720px;
    }
    .thead,
    .trow {
      grid-template-columns: 1.6fr 0.9fr 1.1fr 0.9fr 1fr 1fr;
      padding: 0.5rem 0.5rem;
      font-size: 0.92rem;
    }
  }
</style>
