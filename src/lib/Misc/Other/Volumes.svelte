<script lang="ts">
  import { bgVolume, changeVolume } from "$lib/Agent/Logic/Misc";
</script>

<label for="volume-control">
  Background Audio:
  {$bgVolume}%
</label>

<input
  id="volume-control"
  type="range"
  min="0"
  max="100"
  on:change={(e) => changeVolume(Number(e.currentTarget.value))}
  bind:value={$bgVolume}
/>
