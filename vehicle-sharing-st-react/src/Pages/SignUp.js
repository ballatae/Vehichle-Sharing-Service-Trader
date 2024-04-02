import React, { useState } from "react";

function Signup() {
  const [userData, setUserData] = useState({
    username: "",
  });
  const [password, setPassword] = useState("");
  const [userAddress, setUserAddress] = useState("");

  const handleSignup = async () => {
    //!Simulate assigning a Hardhat address to the user
    const hardhatAddress = "0x..."; // Replace with an actual from metamask
    setUserAddress(hardhatAddress);

    try {
      const response = await fetch("http://localhost:3001/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: userData.username,
          password: password,
          address: hardhatAddress, //! Using the hard-coded address for demonstration
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message); // "User created successfully"
        //? clear the form or redirect the user to another page here
      } else {
        const error = await response.json();
        alert(`Signup failed: ${error.message}`);
      }
    } catch (error) {
      console.error("Error during signup:", error);
      alert("An error occurred, please try again.");
    }

    // Save user data and address to local storage or send to your backend
    localStorage.setItem("userAddress", hardhatAddress);
    localStorage.setItem("userData", JSON.stringify(userData));

    // Inform the user to import the address into MetaMask
    alert("Please import the assigned address into MetaMask to continue.");
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
