import "./SignUp.css";
import React, { useState } from "react";
import LogIn from "./LogIn";

function Signup() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [userData, setUserData] = useState({
    username: "",
    email: "",
  });
  const [password, setPassword] = useState("");
  const [userAddress, setUserAddress] = useState(""); // This will store the address from the server

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
          // address field is not needed, as the Ethereum address and key are generated server-side
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setUserAddress(result.ethereumAddress); // Adjusted to match expected response
        alert(result.message); // "User created successfully"

        // Consider security implications of storing sensitive information on the client side
        localStorage.setItem("userEthereumAddress", result.ethereumAddress);

        // Inform the user
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

  if (isLoggingIn) {
    return <LogIn />;
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

      <button className="link-button" onClick={() => setIsLoggingIn(true)}>
        Already have an account? Log In
      </button>
    </div>
  );
}

export default Signup;
