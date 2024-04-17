import React, { useEffect } from "react";
import { Web3Provider } from "@ethersproject/providers";
import { Contract } from "@ethersproject/contracts";
import { parseEther } from "@ethersproject/units";

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

function Home() {
  let provider, contract;

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  async function connect() {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }
    provider = new Web3Provider(window.ethereum);
    contract = new Contract(contractAddress, abi, provider); // Create a contract instance
    try {
      await provider.send("eth_requestAccounts", []);
      console.log("MetaMask is connected");
    } catch (error) {
      console.error("User denied account access");
    }
  }

  async function execute() {
    if (!provider || !contract) {
      alert("Please connect to MetaMask and load the contract first.");
      return;
    }

    try {
      const signer = provider.getSigner();
      contract = contract.connect(signer);
      const tx = await contract.withdrawTo(
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        parseEther("0.1")
      );
      await tx.wait();
      console.log("Transaction complete!", tx);
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  }

  async function checkLocationAndExecute() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
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
          if (!provider) {
            await connect();
          }
          if (provider) {
            await execute();
          } else {
            console.error("Failed to initialize provider.");
          }
        } else {
          console.error("You are not at the right location.");
        }
      },
      () => {
        alert("Unable to retrieve your location");
      }
    );
  }

  useEffect(() => {
    // Any initial setup if necessary
  }, []);

  return (
    <div>
      <button onClick={connect}>Connect</button>
      <button onClick={execute}>Execute</button>
      <button onClick={checkLocationAndExecute}>
        Check Location & Execute
      </button>
      <br />
      <input type="number" placeholder="Amount in Euros" />
      <div>Euro to Ethereum</div>
    </div>
  );
}

export default Home;
