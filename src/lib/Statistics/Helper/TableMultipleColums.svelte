<script>
  export let cols = [];
  export let rows = [];
  /*  console.log("rows", rows); */

  let sortIdx = 0;
  let sortDir = 1; /* // 1 = asc, -1 = desc */

  const toNum = (v) => {
    const n = parseFloat(String(v).replace(",", "."));
    return Number.isFinite(n) ? n : null;
  };

  const compare = (a, b) => {
    const na = toNum(a),
      nb = toNum(b);
    if (na !== null && nb !== null) return na - nb;
    return String(a).localeCompare(String(b), undefined, {
      numeric: true,
      sensitivity: "base",
    });
  };

  /* https://svelte.dev/playground/9f6c397a6dc642c6838ce932bfc01040?version=5.39.6 */
  /* https://stackoverflow.com/questions/14267781/sorting-html-table-with-javascript */
  function setSort(spalte) {
    if (sortIdx === spalte) sortDir *= -1; /* wenn schonasus dan res */
    else {
      sortIdx = spalte;
      sortDir = 1;
    }
  }

  $: sortedRows = [...(rows || [])].sort(
    (ra, rb) =>
      compare(ra.actualValues?.[sortIdx], rb.actualValues?.[sortIdx]) * sortDir
  );
</script>

<div class="table-wrap">
  <table class="kv">
    <thead>
      <tr>
        {#each cols as c, spalte}
          <th on:click={() => setSort(spalte)} class="sortable">
            {c}
            {sortIdx === spalte ? (sortDir === 1 ? "▲" : "▼") : ""}
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each sortedRows as r}
        <tr id={r.key} class="curhover">
          {#each r.actualValues as v}<td>{v}</td>{/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .table-wrap {
    flex: 1;
    min-height: 0;
    height: 100%;
    width: 100%;
    overflow: auto;
    display: flex;
  }
  .kv {
    flex: 1;
    height: 100%;
    border-collapse: collapse;
    font:
      14px/1.3 system-ui,
      sans-serif;
    table-layout: fixed;
    word-wrap: break-word;
  }
  .kv thead th {
    position: sticky;
    top: 0;
    background: #f7f7f7;
    z-index: 1;
  }
  .kv th,
  .kv td {
    padding: 2px 4px;
    border-bottom: 1px solid #e5e5e5;
    text-align: left;
    white-space: normal;
    overflow-wrap: anywhere;
  }
  .kv tbody tr {
    transition: background 120ms ease;
  }
  .kv tbody tr:hover td {
    background: #80ef00 !important;
  }
  .kv tbody tr:nth-child(odd) td {
    background: #e2e2e2;
  }
  .curhover:hover {
    background: transparent;
  }
  .sortable {
    cursor: pointer;
    user-select: none;
  }
</style>
