import "./SignUp.css";
import React, { useState } from "react";
import LogIn from "./LogIn";
import EthereumDetails from "./EthereumDetails";
import Home from "./Home";
import { Link } from "react-router-dom";

function Signup() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [isAtHome, setIsAtHome] = useState(false);
  const [userData, setUserData] = useState({
    username: "",
    email: "",
  });
  const [password, setPassword] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [userPrivateKey, setUserPrivateKey] = useState("");

  const handleSignup = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: userData.username,
          email: userData.email,
          password: password,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setUserAddress(result.ethereumAddress);
        setUserPrivateKey(result.ethereumPrivateKey);
        setIsSignedUp(true);
        alert(result.message); // "User created successfully"
        localStorage.setItem("userEthereumAddress", result.ethereumAddress);
        alert(
          "Please import the assigned Ethereum address into MetaMask to continue."
        );
      } else {
        const error = await response.json();
        alert(`Signup failed: ${error.message}`);
      }
    } catch (error) {
      console.error("Error during signup:", error);
      alert("An error occurred, please try again.");
    }
  };

  console.log("isSignedUp:", isSignedUp, "isAtHome:", isAtHome);

  if (isLoggingIn) {
    return <LogIn />;
  }

  if (isSignedUp && !isAtHome) {
    return (
      <EthereumDetails
        ethereumAddress={userAddress}
        ethereumPrivateKey={userPrivateKey}
        onContinue={() => {
          console.log("Setting isAtHome to true"); // Debugging line
          setIsAtHome(true);
        }}
      />
    );
  }

  if (isAtHome) {
    console.log("Navigating to Home"); // Debugging line
    return <Home />;
  }

  return (
    <div className="signup-div">
      <div className="avatar"></div>
      <label for="username">Username:</label>
      <input
        id="username"
        className="username"
        type="text"
        // placeholder="Username"
        value={userData.username}
        onChange={(e) => setUserData({ ...userData, username: e.target.value })}
      />
      <br />
      <label htmlFor="email">Email:</label>
      <input
        id="email"
        className="email"
        type="email"
        value={userData.email}
        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
      />
      <br />
      <label for="password">Password:</label>
      <input
        id="password"
        className="password"
        type="password"
        // placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <button className="signup" onClick={handleSignup}>
        Sign Up
      </button>

      <p>
        Already have an account? <Link to="/login">Log In</Link>
      </p>
    </div>
  );
}

export default Signup;
