<script>
  export let title;
  export let description;
  export let options = {};
</script>

<div class="chartcontainer tilt">
  <div
    class="headercontainer"
    style="background-color: {options.backgroundcolor || '#323232'};
           color: {options.color || 'white'};"
  >
    <h3>{title}</h3>
    <small>{description}</small>
  </div>
  <div class="chartself">
    <slot></slot>
  </div>
</div>

<style>
  .chartcontainer {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    border: 1px solid #ccc;
    border-radius: 14px;
    transition: all 0.3s ease-in-out;
    box-shadow:
      0 4px 8px 0 rgba(0, 0, 0, 0.05),
      0 6px 20px 0 rgba(0, 0, 0, 0.05);
  }

  .chartcontainer:hover {
    border: 1px solid #aaa;
    box-shadow:
      0 4px 8px 0 rgba(0, 0, 0, 0.2),
      0 6px 20px 0 rgba(0, 0, 0, 0.19);
  }

  .headercontainer {
    padding: 5px;
    gap: 5px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    border-top-right-radius: 14px;
    border-bottom: #323232 solid 1px;
    margin-bottom: 10px;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.15);
  }

  .chartself {
    flex: 1;
    min-height: 0;
    padding: 10px;
    display: flex;
    flex-direction: column;
  }

  h3 {
    color: white;
    margin: 0 0 0 20px;
  }

  small {
    color: #dfdfdf;
    margin-right: 20px;
  }
</style>
