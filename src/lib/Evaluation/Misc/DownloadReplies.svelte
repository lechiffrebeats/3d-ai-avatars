<script>
  import thankyou from "$lib/images/thankyou.gif";
  import { generalStore } from "$lib/Misc/generalStore";
  import { _ } from "@rgglez/svelte-i18n";
  import { exportAnswers, session } from "../EvalSystem";
  import { goto } from "$app/navigation";
</script>

<div class="main">
  <img
    class="gif"
    alt="Thinking..."
    src={thankyou}
    width="34"
    height="34"
    decoding="async"
    loading="lazy"
    fetchpriority="low"
    draggable="false"
  />
  <button
    class="btn"
    on:click={() => {
      goto("/Results");
    }}>Show Evaluation Results</button
  >
  <h1>You are being redirected in 3 Seconds to the results</h1>

  <button
    on:click={() => {
      $generalStore.SHOW_EVALUATE = false;
    }}
    class="btnnew">{$_("close")}</button
  >
</div>

<style>
  h1 {
    text-align: center;
    font-weight: 600;
    font-size: 1.8rem;
    color: rgb(255, 255, 255);
    margin: 0;
    padding: 0;
  }

  .btnnew {
    margin-bottom: 20px;
    padding: 0rem 1rem;
    background: none;
    color: #fff;

    border: 1px solid rgb(50, 50, 50);
    border-radius: 15px;
    cursor: pointer;

    transition: background-color 0.3s ease-in-out;
  }

  .btn {
    margin-top: 1rem;
    margin-bottom: 1rem;
    padding: 0.5rem 1rem;
    background-color: rgb(244, 98, 0);
    color: #fff;

    border: 1px solid rgb(50, 50, 50);
    border-radius: 15px;
    cursor: pointer;

    transition: background-color 0.3s ease-in-out;
  }

  .btn:hover {
    background-color: rgb(244, 65, 0);
  }

  .main {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  img {
    width: 300px;
    height: 300px;
  }
</style>
