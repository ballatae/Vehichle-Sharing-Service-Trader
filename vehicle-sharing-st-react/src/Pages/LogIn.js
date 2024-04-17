import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function LogIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message); // "Login successful"
        localStorage.setItem("token", result.token);
        navigate("/ethereum-details", {
          state: {
            ethereumAddress: result.ethereumAddress,
            ethereumPrivateKey: result.ethereumPrivateKey,
          },
        });
      } else {
        const error = await response.json();
        alert(`Login failed: ${error.message}`);
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("An error occurred, please try again.");
    }
  };

  return (
    <div className="login-div">
      <div className="avatar"></div>
      <label htmlFor="username">Username:</label>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <br />
      <label htmlFor="password">Password:</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <button onClick={handleLogin}>Log In</button>
      <p>
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </div>
  );
}

export default LogIn;
