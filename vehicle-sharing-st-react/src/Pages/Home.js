import React from "react";
import { useState } from "react";

function Home() {
  const [error, setError] = useState(null);
  const [showAddress, setShowAddress] = useState(null);
  const [accountNames, setAccountNames] = useState({});

  const loginMetamask = async () => {
    if (window.ethereum) {
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((result) => {
          fetchAllDasta(result[0]);
        });
    } else {
      setError("Metamask not installed");
    }
  };

  const fetchAllDasta = (fetch) => {
    setShowAddress(fetch);
  };

  const handleSetName = () => {
    // Simple prompt for demonstration; replace with a better UI in production
    const name = prompt("Enter your display name:");
    if (name) {
      setAccountNames((prevNames) => ({
        ...prevNames,
        [showAddress]: name,
      }));
    }
  };

  return (
    <div>
      METAMASK ADDRESS: {showAddress}
      <br />
      NAME: {accountNames[showAddress] || "No name set"}
      <br />
      <button onClick={loginMetamask}>LogIn via Metamask</button>
      <button onClick={handleSetName}>Set Display Name</button>
      {error}
    </div>
  );
}

export default Home;
