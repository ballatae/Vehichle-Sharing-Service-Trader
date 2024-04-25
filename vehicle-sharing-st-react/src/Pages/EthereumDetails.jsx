import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

function EthereumDetails({ onContinue }) {
  const location = useLocation();
  const navigate = useNavigate(); // Initialize the useNavigate hook
  const { ethereumAddress, ethereumPrivateKey, userId } = location.state || {};

  console.log("Received State in EthereumDetails:", location.state);

   console.log("UserID from state:", userId);
  

  const connectMetaMask = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
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
    console.log("Navigating with userId:", userId);
    setTimeout(() => {
      navigate("/manualTest", {
        state: {
          userId: userId
        }
      })
    }, 1000);
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
