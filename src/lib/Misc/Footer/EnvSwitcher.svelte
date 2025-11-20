<script lang="ts">
  import { triggerAction } from "$lib/Agent/Agent";
  import { setBackgroundImageByName } from "$lib/Agent/Avatar";
  import { chatStore } from "$lib/User/chatStore";
  import { onMount } from "svelte";

  type Mode = "day" | "sunset" | "night";
  let mode: Mode = "day";

  function pick(m: Mode) {
    mode = m;
    setBackgroundImageByName(m);
    triggerAction.emit("SWITCH_ENVIRONMENT", m);
  }

  onMount(() => {
    mode = $chatStore.backgroundImage?.type;
  });
</script>

<div class="env-switch">
  <button class:active={mode === "day"} on:click={() => pick("day")}>Day</button
  >
  <button class:active={mode === "sunset"} on:click={() => pick("sunset")}
    >Sunset</button
  >
  <button class:active={mode === "night"} on:click={() => pick("night")}
    >Night</button
  >
</div>

<style>
  .env-switch {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    border-radius: 8px;
  }
  button {
    appearance: none;
    border: 1px solid rgba(255, 255, 255, 0.14);
    color: #fff;
    background: transparent;
    cursor: pointer;
    border-radius: 5px;
    padding: 6px 10px;
    font-weight: 700;
    font-size: 12px;
    margin-inline: 2px;
  }
  button:hover {
    background: rgba(255, 255, 255, 0.08);
  }
  button.active {
    background: rgba(250, 83, 0, 0.75);
    border-color: transparent;
  }
</style>
