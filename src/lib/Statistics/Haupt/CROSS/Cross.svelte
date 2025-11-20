<script lang="ts">
  import Container from "$lib/Statistics/Helper/Container.svelte";
  import { quickMaths } from "$lib/Statistics/Logic/Hypothesis";
  import AVATAR from "./SUB/AVATAR.svelte";
  import CorrelationsMatrix from "./SUB/CorrelationsMatrix.svelte";
  import Order from "./SUB/Order.svelte";

  setTimeout(() => {
    const reuslt = quickMaths();
    console.log(reuslt);
  }, 500);
</script>

r∈[−1,+1], Pearson mit Spearman als Backup

<Container title="Heatmap mit Deltas" description="">
  <CorrelationsMatrix />
</Container>

<Container title="Reihenfolge" description="">
  order AB BA auswirkuing auf irnwas?, ja: korrektheit bei BA deutlcih besser
  text, interface bei BA klar pro Avatar, bei AB klar pro Text????
  <Order />
</Container>

<Container title="Avatar type" description="">
  Avatar male, female auswirkung n.s
  <AVATAR />
</Container>
