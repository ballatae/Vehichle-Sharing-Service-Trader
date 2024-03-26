window.onload = function () {
  document
    .getElementById("checkLocation")
    .addEventListener("click", async () => {
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          // Replace act. target coordinates and range
          //   City Center, Thessaloniki, Greece L.Sofou 40.63756, 22.93762
          //   City Center, Thessaloniki, Greece L.Sofou 40.63056, 22.94384
          const targetLatitude = 40.63756;
          const targetLongitude = 22.93762;
          const range = 0.01; // Adjusted range

          if (
            Math.abs(latitude - targetLatitude) < range &&
            Math.abs(longitude - targetLongitude) < range
          ) {
            console.log(
              "You are at the right location! Proceeding with Ethereum transaction..."
            );

            // Checking if MetaMask is connected
            if (!window.bundle.provider) {
              await window.bundle.connect();
            }

            if (window.bundle.provider) {
              await window.bundle.execute();
            } else {
              console.log("Failed to initialize provider.");
            }
          } else {
            console.log("You are not at the right location.");
          }
        },
        () => {
          alert("Unable to retrieve your location");
        }
      );
    });
};
