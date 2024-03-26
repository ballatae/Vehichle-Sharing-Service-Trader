const { ethers } = require("ethers");

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const recipientAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

// ABI for EthereumTransfer contract
const abi = [
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

let provider;

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    await ethereum.request({ method: "eth_requestAccounts" });
    console.log("MetaMask is connected");
    provider = new ethers.providers.Web3Provider(window.ethereum);
    return provider;
  } else {
    alert("MetaMask is not installed!");
    return null;
  }
}

async function sendEtherToContract(amountInEther) {
  const signer = provider.getSigner();
  const tx = {
    to: contractAddress,
    value: ethers.utils.parseEther(amountInEther),
  };
  const transactionResponse = await signer.sendTransaction(tx);
  await transactionResponse.wait();
  console.log(`Sent ${amountInEther} ETH to the contract.`);
}

async function withdrawTo(amountInEther) {
  const contract = new ethers.Contract(contractAddress, abi, provider);
  const signer = provider.getSigner();
  const contractWithSigner = contract.connect(signer);
  const transactionResponse = await contractWithSigner.withdrawTo(
    recipientAddress,
    ethers.utils.parseEther(amountInEther)
  );
  await transactionResponse.wait();
  console.log(
    `Withdrawal of ${amountInEther} ETH to ${recipientAddress} was successful.`
  );
}

// New execute function that will be called on button click
async function execute() {
  if (!provider) {
    console.error("Provider is not initialized. Make sure to connect first.");
    return;
  }

  // Convert Euros to Ether inside the execute function
  const amountInEther = await convertEurosToEther();
  if (amountInEther === null) {
    // Handle the case where conversion fails or is aborted
    console.error("Failed to convert Euros to Ether or no amount was entered.");
    return;
  }

  const etherAmountString = amountInEther.toString();

  console.log(`Starting the transactions with ${etherAmountString} ETH...`);

  // Use the converted Ether amount for transactions
  await sendEtherToContract(etherAmountString);
  await withdrawTo(etherAmountString);
}

// Geolocation check
async function checkLocationAndExecute() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      const targetLatitude = 40.63756; // Target location latitude
      const targetLongitude = 22.93762; // Target location longitude
      const range = 0.01; // 10-meter range for location accuracy

      if (
        Math.abs(latitude - targetLatitude) < range &&
        Math.abs(longitude - targetLongitude) < range
      ) {
        console.log(
          "You are at the right location! Proceeding with Ethereum transaction..."
        );

        // Proceed with MetaMask connection and transactions
        if (!provider) {
          await connect();
        }

        if (provider) {
          await execute();
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
}

// This function now just converts Euros to Ether and returns the ether amount
// Ensuring the rate is interpreted as a number for calculation
async function convertEurosToEther() {
  const euroAmount = parseFloat(document.getElementById("euroAmount").value);
  if (isNaN(euroAmount) || euroAmount <= 0) {
    alert("Please enter a valid amount in Euros.");
    return null;
  }

  try {
    const rate = await getEuroToEthereumRate();
    if (typeof rate !== "number" || isNaN(rate)) {
      console.error("Invalid rate obtained from getEuroToEthereumRate.");
      return null;
    }
    const amountInEther = euroAmount * rate;
    console.log(`Calculated ${amountInEther} ETH from ${euroAmount} Euros.`);
    return amountInEther;
  } catch (error) {
    console.error("Failed to convert Euros to Ether:", error);
    return null;
  }
}

// Exposing functions to be accessible from your HTML
window.bundle = {
  connect,
  execute,
  checkLocationAndExecute,
};
