document.getElementById("checkLocation").addEventListener("click", async () => {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      const targetLatitude = 40.63756;
      const targetLongitude = 22.93762;
      const range = 0.1;

      if (
        Math.abs(latitude - targetLatitude) < range &&
        Math.abs(longitude - targetLongitude) < range
      ) {
        console.log(
          "You are at the right location! Proceeding with Ethereum transaction..."
        );

        console.log(
          "Future integration point for MetaMask to initiate a transaction."
        );

        // Conceptual transaction logic (not executable in client-side JS as-is)
        // aiming to achieve conceptually.
        console.log(`Conceptually, this is where a transaction would be initiated from the sender to the recipient,
        using the Hardhat environment's accounts for testing.`);

        // Reminder: Actual transaction logic will require MetaMask or a similar provider.
      } else {
        console.log("You are not at the right location.");
      }
    },
    () => {
      alert("Unable to retrieve your location");
    }
  );
});
