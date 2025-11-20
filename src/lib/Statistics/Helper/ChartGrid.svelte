<div class="grid">
  <slot></slot>
</div>

<style>
  :global(*) {
    box-sizing: border-box;
  }

  .grid {
    height: 100%;
    display: grid;
    gap: 16px;
    grid-template-columns: 1fr;
    align-items: stretch;
    grid-auto-rows: minmax(0, 1fr);
    perspective: 900px;
  }

  @media (min-width: 900px) {
    .grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  .grid > :global(*) {
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
</style>
