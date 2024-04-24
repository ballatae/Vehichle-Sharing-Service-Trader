import React, { useState, useEffect } from "react";
import { Web3Provider } from "@ethersproject/providers";
import { Contract } from "@ethersproject/contracts";
import { parseEther } from "@ethersproject/units";
import { getEuroToEthereumRate } from "./currencyConverter";
import axios from "axios";
import "./ManualTest.css"

// Constants
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

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
  const [recipientAddress, setRecipientAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [recipientAddresses, setRecipientAddresses] = useState([]);
  const [userState, setUserState] = useState("");

  useEffect(() => {
    async function loadRateAndDrivers() {
      try {
        const rate = await getEuroToEthereumRate();
        setEuroToEtherRate(rate);
      } catch (rateError) {
        console.error("Failed to load the exchange rate:", rateError);
      }

      try {
        const response = await axios.get("http://localhost:3001/api/drivers");
        setRecipientAddresses(response.data);
      } catch (driversError) {
        console.error("Failed to fetch driver addresses:", driversError);
      }
    }
    loadRateAndDrivers();
  }, []);

  

  // Dropdown change handler
  function handleRecipientChange(event) {
    setRecipientAddress(event.target.value);
  }

  // Coordinate input handlers
  function handleLatitudeChange(event) {
    setLatitude(event.target.value);
  }

  function handleLongitudeChange(event) {
    setLongitude(event.target.value);
  }

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
    setUserState(`Sent ${amountInEther} ETH to the contract.`);
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
      setUserState(`Withdrawal of ${amountInEther} ETH to ${recipientAddress} was successful.`);
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

    await sendEthersToContract(amountInEther.toFixed(18)); 
    await withdrawTo(amountInEther.toFixed(18)); 
    console.log(`Transactions completed with ${amountInEther.toFixed(18)} ETH.`);
  }

  async function checkLocationAndExecute() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLatitude = position.coords.latitude;
        const userLongitude = position.coords.longitude;
        const range = 0.1;

        if (
          Math.abs(userLatitude - parseFloat(latitude)) < range &&
          Math.abs(userLongitude - parseFloat(longitude)) < range
        ) {
          setUserState("You are at the right location! Proceeding with Ethereum transaction...");
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
          setUserState("You are not at the right location.");
          console.error("You are not at the right location.");
          // alert("You are not at the right location.");
        }
      },
      () => {
        setUserState("Unable to retrieve your location");
        alert("Unable to retrieve your location");
      }
    );
  }

  return (
    <div className="manual_test">
      <br />
      <strong>Amount to be payed: </strong>
      <input
        type="number"
        placeholder="Amount in Euros"
        value={amountInEuros}
        onChange={(e) => setAmountInEuros(e.target.value)}
      />
      <br />
      <strong>Select one of the drivers you want to send the money to:</strong>
      <select value={recipientAddress} onChange={(e) => setRecipientAddress(e.target.value)}>
        <option value="">Select Recipient (Driver)</option>
        {recipientAddresses.map((addr) => (
          <option key={addr.ethereumAddress} value={addr.ethereumAddress}>
            {addr.ethereumAddress}
          </option>
        ))}
      </select>

      <br />
      <strong>Enter the coordinates manually</strong>
      <input
        type="text"
        placeholder="Latitude"
        value={latitude}
        onChange={(e) => setLatitude(e.target.value)}
      />
      <input
        type="text"
        placeholder="Longitude"
        value={longitude}
        onChange={(e) => setLongitude(e.target.value)}
      />
      {/* <div>Rate: {euroToEtherRate ? `${euroToEtherRate} ETH per Euro` : "Loading..."}</div> */}

      <p id="userState">{userState}</p>
      <br />
      <button onClick={connect}>Connect to wallet</button>
      <button onClick={executeTransaction}>Proceed with Payment</button>
      <button onClick={checkLocationAndExecute}>Check Location & Proceed with Payment</button>
    </div>
  );
}


export default ManualTest;