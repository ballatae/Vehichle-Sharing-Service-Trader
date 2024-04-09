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
          // No need to send the address from here, the server will generate it
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // Use the address returned from the server
        setUserAddress(result.address); // Assuming the server includes the address in its response
        alert(result.message); // "User created successfully"
        // You might want to clear the form or redirect the user here

        // Optionally save user data and address to local storage
        localStorage.setItem("userAddress", result.address); // Save the address from the server
        localStorage.setItem("userData", JSON.stringify(userData));

        // Inform the user to import the address into MetaMask
        alert("Please import the assigned address into MetaMask to continue.");
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
