<script>
  import { page } from "$app/stores";
  import travolta from "$lib/images/travolta.gif";
</script>

<h1>{$page.status}: {$page.error.message}</h1>

<svelte:head>
  <title>{$page.status}: {$page.error.message}</title>
</svelte:head>

<!-- svelte-ignore a11y_missing_attribute -->
<img
  src={travolta}
  alt=""
  class="travolta"
  decoding="async"
  loading="lazy"
  fetchpriority="low"
  draggable="false"
  width="200"
  height="300"
/>

<style>
  .travolta {
    display: block;
    margin: 0 auto;
    width: 50%;
  }
</style>
