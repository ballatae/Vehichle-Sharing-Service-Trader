document.getElementById("checkLocation").addEventListener("click", () => {
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
      const range = 0.1;

      if (
        Math.abs(latitude - targetLatitude) < range &&
        Math.abs(longitude - targetLongitude) < range
      ) {
        console.log(
          "You are at the right location! Proceeding with Ethereum transaction..."
        );

        // Ensure ethers.js is available
        if (typeof ethers !== "undefined") {
          try {
            const provider = new ethers.providers.Web3Provider(
              window.ethereum,
              "any"
            );
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();

            //ABI and address
            const contractABI = [
              {
                anonymous: false,
                inputs: [
                  {
                    indexed: true,
                    internalType: "address",
                    name: "receiver",
                    type: "address",
                  },
                  {
                    indexed: false,
                    internalType: "uint256",
                    name: "amount",
                    type: "uint256",
                  },
                ],
                name: "Withdrawal",
                type: "event",
              },
              {
                inputs: [
                  {
                    internalType: "address",
                    name: "",
                    type: "address",
                  },
                ],
                name: "accountBalances",
                outputs: [
                  {
                    internalType: "uint256",
                    name: "",
                    type: "uint256",
                  },
                ],
                stateMutability: "view",
                type: "function",
              },
              {
                inputs: [
                  {
                    internalType: "address",
                    name: "accountAddress",
                    type: "address",
                  },
                ],
                name: "getAccountBalances",
                outputs: [
                  {
                    internalType: "uint256",
                    name: "",
                    type: "uint256",
                  },
                ],
                stateMutability: "view",
                type: "function",
              },
              {
                inputs: [
                  {
                    internalType: "uint256",
                    name: "amount",
                    type: "uint256",
                  },
                ],
                name: "withdraw",
                outputs: [],
                stateMutability: "nonpayable",
                type: "function",
              },
              {
                inputs: [
                  {
                    internalType: "address payable",
                    name: "recipient",
                    type: "address",
                  },
                  {
                    internalType: "uint256",
                    name: "amount",
                    type: "uint256",
                  },
                ],
                name: "withdrawTo",
                outputs: [],
                stateMutability: "nonpayable",
                type: "function",
              },
              {
                stateMutability: "payable",
                type: "receive",
              },
            ];
            const contractAddress =
              "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // Replace with your contract's address

            const contract = new ethers.Contract(
              contractAddress,
              contractABI,
              signer
            );

            const recipientAddress =
              "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"; // Example recipient address
            const amount = ethers.utils.parseEther("25.00"); // Example amount in Ether

            const txResponse = await contract.withdrawTo(
              recipientAddress,
              amount
            );
            await txResponse.wait(); // Wait for the transaction to be mined
            console.log("Transaction completed successfully.");
          } catch (error) {
            console.error("Transaction failed:", error);
          }
        } else {
          console.log("Ethereum object not found; please install MetaMask.");
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
