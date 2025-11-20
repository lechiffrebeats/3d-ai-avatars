<script>
  import { languages } from "$lib/Misc/sessionStore";
  import Container from "../Helper/Container.svelte";
  import { statistics } from "../Logic/Aggregate";
  import { median } from "../Logic/HelpersMath";
  import { formatMs } from "../Logic/HelpersStatisitcs";
  import { totalTimeSpendMS } from "../Logic/Overall";

  $: participants = $statistics.all.raw.length;
  $: meanNumberMessages = Math.round(totalMessages / participants);

  $: totalMessages = $statistics?.metas?.aggregated?.reduce(
    (sum, sess) => sum + sess?.msg_count || 0,
    0
  );

  $: totalTimeMs = totalTimeSpendMS($statistics);
  $: totalTime = formatMs(totalTimeMs);
  $: medianTime = formatMs(
    median($statistics?.all?.raw.map((t) => t.completion_time))
  );

  $: meanTime = formatMs(totalTimeMs / participants);

  const options = { color: "rgb(255, 81, 0)" };
</script>

<!-- TABLE SOURCE: https://codepen.io/AllThingsSmitty/pen/MyqmdM -->
<Container
  title="Overview"
  {options}
  description="Overview for Evaluation started on Sep 22 2025 12:09:50 GMT+0200 - {new Date().toLocaleDateString()} "
>
  <slot>
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
            <tr><td>Participants</td><td>{participants}</td></tr>
            <tr><td>Total Messages</td><td>{totalMessages}</td></tr>
            <tr
              ><td>Messages per participant</td><td
                >Mean {Number(totalMessages / participants).toFixed(
                  0
                )}<!--  ,Mean {meanNumberMessages} -->
              </td></tr
            >
            <tr><td>Total time spend</td><td>{totalTime} </td></tr>
            <tr
              ><td>Completion time per participant</td><td
                >Median {medianTime}, Mean {meanTime}</td
              ></tr
            >
            <tr><td>Unique Visitors (28 Days)</td><td>1.2k</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </slot>
</Container>

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
    padding: 10px 12px;
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
