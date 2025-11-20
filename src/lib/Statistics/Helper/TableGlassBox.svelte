<script>
  export let dataarr = {};
</script>

<!-- <ContainerData title="Key Data" description="Median, Mean, SD etc"> -->
<div class="part">
  <div class="table-wrap">
    <table class="kv">
      <thead>
        <tr>
          <th>Type</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        {#each Object.entries(dataarr) as [name, value]}
          <tr
            ><td>{name}</td><td
              >{#if typeof value === "object"}
                {JSON.stringify(value)}{:else}
                {value}
              {/if}</td
            ></tr
          >
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  .table-wrap {
    overflow-x: auto;
  }
  .kv {
    width: 100%;
    border-collapse: collapse;
    font:
      14px/1.4 system-ui,
      sans-serif;
  }
  .kv th,
  .kv td {
    width: 100%;
    padding: 1px 7px;
    border-bottom: 1px solid #e5e5e5;
    text-align: left;
  }
  .kv thead th {
    background: #f7f7f7;
  }
  .kv tbody tr:nth-child(odd) td {
    background: #fafafa;
  }
</style>
