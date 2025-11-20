<script>
  import HistChatInterface from "$lib/Modalities/Input_Avatar.svelte";
  import AgentAvatarFixed from "$lib/Agent/Avatar.svelte";
</script>

<div class="scene-container">
  <AgentAvatarFixed />
</div>

<div class="ui-overlay">
  <div class="chat-input-field">
    <HistChatInterface />
  </div>
</div>

<style>
  .scene-container {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    z-index: 0;
    margin: 0;
    padding: 0;
  }

  .ui-overlay {
    position: fixed;
    inset: 0;
    z-index: 50;
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    pointer-events: none;
  }

  .chat-input-field {
    pointer-events: auto;
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    bottom: calc(2.6rem + env(safe-area-inset-bottom, 0px));
    width: 450px;
    max-width: min(90%, 640px);
    padding: 1rem 1.5rem;
    border-radius: 5rem;
    border: 1.5px solid rgba(255, 255, 255, 1);
    background: rgba(255, 255, 255, 0.21);
    backdrop-filter: blur(7px);
    -webkit-backdrop-filter: blur(7px);
    box-shadow: 0 6px 22px rgba(0, 0, 0, 0.18);
    touch-action: manipulation;
  }

  @media (max-width: 680px) {
    .chat-input-field {
      left: 12px;
      right: 12px;
      transform: none;
      width: auto;
      max-width: none;
      padding: 0.7rem 0.9rem;
      border-radius: 1.4rem;
      bottom: calc(5rem + env(safe-area-inset-bottom, 0px));
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
    }

    .scene-container {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      height: 100dvh;
      z-index: 0;
      margin: 0;
      padding: 0;
    }
  }

  @media (max-width: 360px) {
    .chat-input-field {
      left: 8px;
      right: 8px;
      padding: 0.6rem 0.8rem;
      border-radius: 1.2rem;
      bottom: calc(7rem + env(safe-area-inset-bottom, 0px));
    }
  }

  @supports (position: sticky) {
    .chat-input-field {
      position: fixed;
    }
  }
</style>
