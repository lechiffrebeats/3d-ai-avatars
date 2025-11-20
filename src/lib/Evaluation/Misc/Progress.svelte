<script>
  import { session } from "../EvalSystem";
  let length = $session.steps.length;
</script>

<div class="progress">
  <div
    class="fill"
    style="width: {(($session.currStep + 1) / length) *
      100}%; background: linear-gradient(90deg, #ff9800, #f44336)"
  >
    <span class="label">{$session.currStep + 1} / {length}</span>
  </div>
</div>

<style>
  .progress {
    position: relative;
    min-height: 12px;
    max-height: 12px;
    background: #ddd;
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 8px;
  }
  .fill {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 6px;
    color: #fff;
    font-size: 12px;
    white-space: nowrap;
    transition: width 0.3s;
  }
  .label {
    font-weight: 600;
  }
</style>
