// Function to get the exchange rate from Euro to Ethereum
function getEuroToEthereumRate() {
  const apiKey = "cur_live_fGjBA2kPwa6xbU2fBnFHMv4KWunyVbNxA8Gh9wdA"; // API key
  const url = `https://api.currencyapi.com/v3/latest?apikey=${apiKey}&currencies=ETH&base_currency=EUR`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const rate = data.data.ETH.value;
      console.log(`The exchange rate from Euro to Ethereum is: ${rate}`);
      // Assuming you have an element with ID 'rateDisplay' where you want to show the rate
      document.getElementById(
        "rateDisplay"
      ).innerText = `The exchange rate from Euro to Ethereum is: ${rate}`;
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      // Optionally update the UI or log to indicate the fetch was unsuccessful
    });
}

// Since this is in the global scope, it will be accessible to the inline onclick handler
