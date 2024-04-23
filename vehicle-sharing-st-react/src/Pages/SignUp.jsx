import "./SignUp.css";
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";


function Signup() {
  const [userData, setUserData] = useState({ username: "", email: "" });
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: userData.username,
          email: userData.email,
          password: password,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message); // "User created successfully"
        localStorage.setItem("userEthereumAddress", result.ethereumAddress);
        alert("Please import the assigned Ethereum address into MetaMask to continue.");

        // Use navigate to pass state to the EthereumDetails component
        navigate("/login", {
          state: { 
            
          },
        });
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
    <div className="signup-div">
      <div className="avatar"></div>
      <label htmlFor="username">Username:</label>
      <input
        id="username"
        className="username"
        type="text"
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
      <label htmlFor="password">Password:</label>
      <input
        id="password"
        className="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <button onClick={handleSignup}>Sign Up</button>
      <p>
        Already have an account? <Link to="/login">Log In</Link>
      </p>
    </div>
  );
}

export default Signup;