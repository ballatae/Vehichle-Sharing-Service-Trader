import React, { useState } from "react";

function Signup() {
  const [userData, setUserData] = useState({
    username: "",
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

  return (
    <div>
      <input
        type="text"
        placeholder="Username"
        value={userData.username}
        onChange={(e) => setUserData({ ...userData, username: e.target.value })}
      />
      <br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <button onClick={handleSignup}>Sign Up</button>
    </div>
  );
}

export default Signup;
