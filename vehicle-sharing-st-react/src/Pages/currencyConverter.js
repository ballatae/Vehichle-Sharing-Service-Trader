export function getEuroToEthereumRate() {
  const apiKey = "cur_live_fGjBA2kPwa6xbU2fBnFHMv4KWunyVbNxA8Gh9wdA";
  const url = `https://api.currencyapi.com/v3/latest?apikey=${apiKey}&currencies=ETH&base_currency=EUR`;

  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      const rate = data.data.ETH.value;
      console.log(`The exchange rate from Euro to Ethereum is: ${rate}`);
      return rate;
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      throw error;
    });
}
