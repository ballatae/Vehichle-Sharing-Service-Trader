import React from "react";
import { ethers } from "ethers";

function EthereumDetails({ ethereumAddress, ethereumPrivateKey, onContinue }) {
  // Function to connect to MetaMask
  const connectMetaMask = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });
        alert("MetaMask is connected.");
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
        alert(
          "Failed to connect MetaMask. Make sure MetaMask is installed and you have granted access."
        );
      }
    } else {
      alert("MetaMask is not installed!");
    }
  };

  const handleContinue = () => {
    console.log("Continuing to Home..."); // Debugging line
    setTimeout(() => {
      onContinue();
    }, 1000); // Delays the continuation by 1 second
  };

  return (
    <div className="ethereum-details-div">
      <h1>Metamask Details</h1>
      <p>
        <strong>Address:</strong> {ethereumAddress}
      </p>
      <p>
        <strong>Private Key:</strong> {ethereumPrivateKey || "Not available"}
      </p>
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
