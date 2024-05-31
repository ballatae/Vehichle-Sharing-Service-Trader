import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Web3Provider } from "@ethersproject/providers";
import { Contract } from "@ethersproject/contracts";
import { parseEther } from "@ethersproject/units";
import { getEuroToEthereumRate } from "./currencyConverter";
import axios from "axios";
import "./ManualTest.css";
import image1 from '../photos/1.png';
import image2 from '../photos/2.png';
import image3 from '../photos/3.png';
import image4 from '../photos/4.png';

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
  const location = useLocation();
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [amountInEuros, setAmountInEuros] = useState("");
  const [euroToEtherRate, setEuroToEtherRate] = useState(null);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [routeLength, setRouteLength] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [recipientAddresses, setRecipientAddresses] = useState([]);
  const [userState, setUserState] = useState("");
  const [progress, setProgress] = useState({ width: "10%", color: "red" });
  const [currentImage, setCurrentImage] = useState(image1);

  useEffect(() => {
    if (location.state) {
      setAmountInEuros(location.state.segmentCost || "");
      setLatitude(location.state.lastLatitude || "");
      setLongitude(location.state.lastLongitude || "");
    }
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
  }, [location.state]);

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
    setProgress({ width: "50%", color: "orange" });
    setCurrentImage(image2);
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
      setProgress({ width: "75%", color: "yellow" });
      setCurrentImage(image3);
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
    
    setUserState("Transactions completed.");
    setProgress({ width: "100%", color: "green" });
    setCurrentImage(image4);
    console.log(`Transactions completed with ${amountInEther.toFixed(18)} ETH.`);
  }

  async function connectAndExecuteTransaction() {
    await connect();
    if (provider) {
      await executeTransaction();
    }
  }

  async function connectAndCheckLocationAndExecute() {
    await connect();
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLatitude = position.coords.latitude;
        const userLongitude = position.coords.longitude;

        // Convert route length from meters to kilometers
        const routeLengthKm = routeLength / 1000;

        // Calculate the range using a single expression
        const range = routeLengthKm * ((routeLengthKm >= 50) ? 0.01 : 0.05);

        // Check if the user is within the required range
        if (
          Math.abs(userLatitude - parseFloat(latitude)) < range &&
          Math.abs(userLongitude - parseFloat(longitude)) < range
        ) {
          setUserState("You are at the right location! Proceeding with Ethereum transaction...");
          console.log("You are at the right location! Proceeding with Ethereum transaction...");
          if (provider) {
            await executeTransaction();
          } else {
            console.error("Failed to initialize provider.");
          }
        } else {
          setUserState("You are not at the right location.");
          console.error("You are not at the right location.");
        }
      },
      () => {
        setUserState("Unable to retrieve your location");
        alert("Unable to retrieve your location");
      }
    );
  }

  const addressText = "Kromila Building - 40.63054328673723, 22.9438582463234, Sofou Building - 40.63747724119382, 22.936779912593263, Egnatia 7 - 40.63980161636855, 22.93707937684154";

const formattedAddress = addressText.split(", ").map((item, index) => (
  <React.Fragment key={index}>
    {item}
    <br />
  </React.Fragment>
));

  return (
    <div className="manual_test">
      <div className="input-group">
        <div>
          <strong>Amount to be paid: </strong>
          <input
            type="number"
            placeholder="Amount in Euros"
            value={amountInEuros}
            onChange={(e) => setAmountInEuros(e.target.value)}
          />
        </div>
        <div>
          <strong>Select one of the drivers you want to send the money to:</strong>
          <select value={recipientAddress} onChange={(e) => setRecipientAddress(e.target.value)}>
            <option value="">Select Recipient (Driver)</option>
            {recipientAddresses.map((addr) => (
              <option className="addressesman" key={addr.ethereumAddress} value={addr.ethereumAddress}>
                {addr.username}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="input-group">
        <div>
          <input
            type="text"
            placeholder="Latitude"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Longitude"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
          />
        </div>
      </div>

      <div className="input-group">
        <div>
          <strong>Enter the route length in meters</strong>
          <input
            type="number"
            placeholder="Route Length in Meters"
            value={routeLength}
            onChange={(e) => setRouteLength(e.target.value)}
          />
        </div>
      </div>

      <p className="formattedAddress">Some addresses for testing:</p>
      <p className="formattedAddress">{formattedAddress}</p>
      

      {userState && (
        <>
          <p id="userState">{userState}</p>
          <div className="progress-container">
            <img src={currentImage} alt="Progress" className="progress-image" />
            <div className="progress-bar" style={{ width: progress.width, backgroundColor: progress.color }}></div>
          </div>
        </>
      )}

      <div className="button-group">
        <button onClick={connect}>Connect to wallet</button>
        <button onClick={connectAndExecuteTransaction}>Proceed with Payment</button>
        <button onClick={connectAndCheckLocationAndExecute}>Check Location & Proceed with Payment</button>
      </div>
    </div>
  );
}

export default ManualTest;