import React, { useState, useEffect } from "react";
import { Web3Provider } from "@ethersproject/providers";
import { Contract } from "@ethersproject/contracts";
import { parseEther } from "@ethersproject/units";
import { getEuroToEthereumRate } from "./currencyConverter";

// Constants
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const recipientAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
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

function ManualTest() {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [amountInEuros, setAmountInEuros] = useState("");
  const [euroToEtherRate, setEuroToEtherRate] = useState(null);

  useEffect(() => {
    const loadRate = async () => {
      try {
        const rate = await getEuroToEthereumRate();
        setEuroToEtherRate(rate);
      } catch (error) {
        console.error("Failed to load the exchange rate:", error);
      }
    };
    loadRate();
  }, []);

  async function connect() {
    if (window.ethereum) {
      try {
        const web3Provider = new Web3Provider(window.ethereum);
        const signer = web3Provider.getSigner();
        const contractInstance = new Contract(contractAddress, abi, signer);
        await web3Provider.send("eth_requestAccounts", []);
        console.log("MetaMask is connected");
        setProvider(web3Provider);
        setContract(contractInstance);
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
        alert("Error connecting to MetaMask. Check the console for more information.");
      }
    } else {
      alert("Please install MetaMask to use this app.");
    }
  }

  async function sendEthersToContract(amountInEther) {
    if (!provider) {
      alert("Please connect to MetaMask first.");
      return;
    }
    const signer = provider.getSigner();
    const transactionResponse = await signer.sendTransaction({
      to: contractAddress,
      value: parseEther(amountInEther.toString()),
    });
    await transactionResponse.wait();
    console.log(`Sent ${amountInEther} ETH to the contract.`);
  }

  async function withdrawTo(amountInEther) {
    if (!provider || !contract) {
      alert("Please connect to MetaMask and load the contract.");
      return;
    }
    try {
      const transactionResponse = await contract.withdrawTo(
        recipientAddress,
        parseEther(amountInEther.toString())
      );
      await transactionResponse.wait();
      console.log(`Withdrawal of ${amountInEther} ETH to ${recipientAddress} was successful.`);
    } catch (error) {
      console.error("Withdrawal failed:", error);
      alert("Withdrawal failed. Check the console for more information.");
    }
  }

  async function executeTransaction() {
    if (!amountInEuros) {
      alert("Please enter a valid amount in Euros.");
      return;
    }
    const amountInEther = parseFloat(amountInEuros) * euroToEtherRate;
    if (isNaN(amountInEther)) {
      alert("Invalid amount. Please check your input and the exchange rate.");
      return;
    }

    await sendEthersToContract(amountInEther.toFixed(18)); // Adjust decimal precision as needed
    await withdrawTo(amountInEther.toFixed(18)); // Adjust decimal precision as needed
    console.log(`Transactions completed with ${amountInEther.toFixed(18)} ETH.`);
  }
  

  async function checkLocationAndExecute() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const targetLatitude = 40.63979308054933;
        const targetLongitude = 22.93696029422671;
        const range = 0.1;

        //egnatia 7 40.63979308054933, 22.93696029422671 
        // sofou building 40.63756, 22.93762
        if (
          Math.abs(latitude - targetLatitude) < range &&
          Math.abs(longitude - targetLongitude) < range
        ) {
          console.log("You are at the right location! Proceeding with Ethereum transaction...");
          if (!provider) {
            await connect();
          }
          if (provider) {
            await executeTransaction();
          } else {
            console.error("Failed to initialize provider.");
          }
        } else {
          console.error("You are not at the right location.");
          alert("You are not at the right location.");
        }
      },
      () => {
        alert("Unable to retrieve your location");
      }
    );
  }


  


  function handleAmountChange(event) {
    setAmountInEuros(event.target.value);
  }

  return (
    <div>
      <button onClick={connect}>Connect</button>
      <button onClick={executeTransaction}>Execute Transaction</button>
      <button onClick={checkLocationAndExecute}>Check Location & Execute</button>
      <br />
      <input
        type="number"
        placeholder="Amount in Euros"
        value={amountInEuros}
        onChange={handleAmountChange}
      />
      <div>Rate: {euroToEtherRate ? `${euroToEtherRate} ETH per Euro` : "Loading..."}</div>
    </div>
  );
}

export default ManualTest;

