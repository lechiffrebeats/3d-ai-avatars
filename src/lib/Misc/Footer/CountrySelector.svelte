<script>
  let language = "en";
  let currency = "USD";
  import globeSvg from "$lib/images/Icons/globe-svgrepo-com.svg";
  import currencySvg from "$lib/images//Icons/currency-euro-svgrepo-com.svg";

  const changeLanguage = (event) => {
    language = event.target.value;
    console.log(`Language changed to: ${language}`);
  };

  const changeCurrency = (event) => {
    currency = event.target.value;
    console.log(`Currency changed to: ${currency}`);
  };
</script>

<div class="selection-container">
  <div class="selection">
    <div class="dropdown">
      <button class="dropbtn">
        <img src={globeSvg} alt="Language" class="icon" />
        Language
      </button>
      <div class="dropdown-content">
        <select id="language-select" onchange={changeLanguage}>
          <option value="en">English</option>
          <option value="de">Deutsch</option>
        </select>
      </div>
    </div>
  </div>
  <div class="selection">
    <div class="dropdown">
      <button class="dropbtn">
        <img src={currencySvg} alt="Currency" class="icon" />
        Currency
      </button>
      <div class="dropdown-content">
        <select id="currency-select" onchange={changeCurrency}>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
        </select>
      </div>
    </div>
  </div>
</div>

<style>
  .selection-container {
    gap: 10px;
    display: flex;
    justify-content: space-around;
    border-radius: 5px;
    margin: 0 auto;
  }

  .selection {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .dropdown {
    position: relative;
    display: inline-block;
  }

  .dropbtn {
    display: flex;
    align-items: center;
    flex-direction: row;
    gap: 5px;
    color: rgb(76, 76, 76);

    border: none;
    background: none;
    cursor: pointer;
    font-size: 0.8rem;
    transition: color 0.3s ease;
  }

  .icon {
    width: 20px;
    height: 20px;
  }

  .dropdown-content {
    display: none;
    position: absolute;
    background-color: #f9f9f9;
    min-width: 160px;
    box-shadow: 0px -8px 16px 0px rgba(0, 0, 0, 0.2);
    z-index: 1;
    border-radius: 5px;
    overflow: hidden;
    bottom: 100%; /* Position above the button */
  }

  .dropdown:hover .dropdown-content {
    display: block;
  }

  select {
    width: 100%;
    padding: 8px;
    border: none;
    border-radius: 5px;
    background-color: #f9f9f9;
    cursor: pointer;
  }

  .dropbtn:hover {
    text-decoration: underline;
  }
</style>
