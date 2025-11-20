<script>
  import { generalStore } from "$lib/Misc/generalStore";
</script>

<button aria-label="Minimieren" class="minimize">
  {$generalStore.SHOW_EVALUATE ? "-" : "+"}
</button>

<style>
  .minimize {
    cursor: pointer;
    width: 28px;
    height: 28px;
    font-weight: 700;
    margin: 0;
    padding: 0;
    background-color: rgb(244, 65, 0);
    color: white;
    border: 2px solid rgb(255, 255, 255);
    border-radius: 50%;
  }

  .minimize:hover {
    transform: scale(1.1);
    transition: transform 0.3s ease-in-out;
  }
</style>
