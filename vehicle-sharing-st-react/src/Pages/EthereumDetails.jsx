import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios"; // Ensure axios is imported to make HTTP requests

function EthereumDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { ethereumAddress, ethereumPrivateKey, userId } = location.state || {};

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
        console.log(response.data); // Log the full response data
        const activeRoutes = response.data; // Assuming response.data is the array of routes
        if (activeRoutes.length === 0) {
            throw new Error('No active routes found');
        }
        const data = activeRoutes[0]; // Use the first active route
        const lastCoordinatePair = data.initialRoute?.geometry?.coordinates[0]?.slice(-1)[0];
        const segmentCostValue = data.costDetails.segmentCost["1"].$numberDecimal;


        setTimeout(() => {
            navigate("/manualTest", {
                state: {
                    userId: userId,
                    segmentCost: segmentCostValue || "0",
                    lastLongitude: lastCoordinatePair ? lastCoordinatePair[0] : undefined,
                    lastLatitude: lastCoordinatePair ? lastCoordinatePair[1] : undefined
                }
            });
        }, 1000);
    } catch (error) {
        console.error('Failed to fetch active route details:', error);
    }
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
