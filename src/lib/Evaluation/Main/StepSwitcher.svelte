<script lang="ts">
  import { session } from "../EvalSystem";

  const registry = {
    Template: () => import("./Template.svelte"),
    StepStart: () => import("../StepsMisc/StepStart.svelte"),
    StepInfo: () => import("../StepsMisc/StepInfo.svelte"),
    StepDemo: () => import("../StepsMisc/StepDemo.svelte"),
    StepTimer: () => import("../StepsMisc/StepTimer.svelte"),
    StepLos: () => import("../StepsMisc/StepLos.svelte"),
  } as const;

  let Comp: any = null;
  let token = 0;

  async function loadAt(i: number) {
    const my = ++token;
    const st = $session.steps[i];
    const key = st?.component ?? "Template";
    const mod = await registry[key]();
    if (my !== token) return;
    Comp = mod.default;
    const nxt = $session.steps[i + 1]?.component ?? "Template";
    registry[nxt]?.();
  }

  $: loadAt($session.currStep);

  /* https://chat-ai.academiccloud.de/arcanas/folder/Universit%C3%A4t%20Bremen */
</script>

<div class="Switcher-Container">
  {#if Comp}
    {#key $session.currStep}
      <svelte:component this={Comp} />
    {/key}
  {/if}
</div>

<style>
  .Switcher-Container {
    width: 100%;
    position: relative;
    height: 100%;
  }
</style>
