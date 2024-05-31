import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import metamaskLogo from '../photos/metamask.png';

function EthereumDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { ethereumAddress, ethereumPrivateKey, userId, username } = location.state || {};

  const [copyMessage, setCopyMessage] = useState("");
  const [lastCopiedButton, setLastCopiedButton] = useState("");
  const [buttonText, setButtonText] = useState({
    address: "Copy Address",
    privateKey: "Copy Private Key"
  });

  console.log("Received State in EthereumDetails:", location.state);

  const connectMetaMask = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        alert("MetaMask is connected.");
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
        alert("Failed to connect MetaMask. Make sure MetaMask is installed and you have granted access.");
      }
    } else {
      alert("MetaMask is not installed!");
    }
  };

  const handleContinue = async () => {
    console.log("Navigating with userId:", userId);
    try {
      const response = await axios.get('http://localhost:3001/api/activeroutes');
      console.log(response.data);
      const activeRoutes = response.data;
      if (activeRoutes.length === 0) {
        throw new Error('No active routes found');
      }
      const data = activeRoutes[0];
      const lastCoordinatePair = data.initialRoute?.geometry?.coordinates[0]?.slice(-1)[0];
      const segmentCostValue = data.costDetails.segmentCost["1"].$numberDecimal;

      setTimeout(() => {
        navigate("/activeRoutes", {
          state: {
            userId: userId,
            segmentCost: segmentCostValue || "0",
            lastLongitude: lastCoordinatePair ? lastCoordinatePair[0] : undefined,
            lastLatitude: lastCoordinatePair ? lastCoordinatePair[1] : undefined
          }
        });
      }, 1000);
    } catch (error) {
      navigate("/activeRoutes", {
        state: {
          userId: userId
        }
      });
      console.error('Failed to fetch active route details:', error);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopyMessage(`${type} copied to clipboard!`);
        setLastCopiedButton(type);
        setButtonText(prevState => ({
          ...prevState,
          [type === "Address" ? "address" : "privateKey"]: "Copied"
        }));
        setTimeout(() => {
          setCopyMessage("");
          setLastCopiedButton("");
          setButtonText(prevState => ({
            ...prevState,
            [type === "Address" ? "address" : "privateKey"]: type === "Address" ? "Copy Address" : "Copy Private Key"
          }));
        }, 5000);
      },
      (err) => {
        console.error('Failed to copy: ', err);
      }
    );
  };

  return (
    <div className="ethereum-details-div">
      <img src={metamaskLogo} alt="MetaMask Logo" style={{ width: "100px", height: "100px" }} />
      <h1>MetaMask Details</h1>
      <p>Hello, {username}</p>
      <p>These are your details to connect to MetaMask wallet. Please connect to MetaMask before continuing.</p>
      <div className="details-row">
        <p className={`detail-text ${lastCopiedButton === "Address" ? "copied" : ""}`}>
          <strong>Address:</strong> {ethereumAddress}
        </p>
        <button className="copy"
          onClick={() => copyToClipboard(ethereumAddress, "Address")}
          style={{ backgroundColor: lastCopiedButton === "Address" ? "green" : "" }}
        >
          {buttonText.address}
        </button>
      </div>
      <div className="details-row">
        <p className={`detail-text ${lastCopiedButton === "Private Key" ? "copied" : ""}`}>
          <strong>Private Key:</strong> {ethereumPrivateKey || "Not available"}
        </p>
        {ethereumPrivateKey && (
          <button className="copy"
            onClick={() => copyToClipboard(ethereumPrivateKey, "Private Key")}
            style={{ backgroundColor: lastCopiedButton === "Private Key" ? "green" : "" }}
          >
            {buttonText.privateKey}
          </button>
        )}
      </div>
      {copyMessage && <p>{copyMessage}</p>}
      <button className="connect-metamask-button" onClick={connectMetaMask}>
        Connect MetaMask
      </button>
      <button className="continue-button" onClick={handleContinue}>
        Continue
      </button>
    </div>
  );
}

export default EthereumDetails;
