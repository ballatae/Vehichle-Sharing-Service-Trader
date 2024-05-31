import "./SignUp.css";
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import vshlogo from '../photos/vshlogo.png';


function Signup() {
  const [userData, setUserData] = useState({ username: "", email: "" });
  const [password, setPassword] = useState("");
  const [passwordChecks, setPasswordChecks] = useState({
    minLength: false,
    hasLetter: false,
    hasNumber: false,
    hasSymbol: false
  });
  const navigate = useNavigate();

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[^a-zA-Z\d\s]/.test(password);  

    setPasswordChecks({
      minLength,
      hasLetter,
      hasNumber,
      hasSymbol
    });
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
  };

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
        alert(result.message); 
        localStorage.setItem("userEthereumAddress", result.ethereumAddress);
        navigate("/login");
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
      <img className="vslogo" src={vshlogo} alt="vshlogo" style={{ width: "100px", height: "100px" }} />
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
        onChange={handlePasswordChange}
      />
      <div className="password-requirements">
        <p style={{ color: passwordChecks.minLength ? 'green' : 'red' }}>At least 8 characters</p>
        <p style={{ color: passwordChecks.hasLetter ? 'green' : 'red' }}>At least one letter</p>
        <p style={{ color: passwordChecks.hasNumber ? 'green' : 'red' }}>At least one number</p>
        <p style={{ color: passwordChecks.hasSymbol ? 'green' : 'red' }}>At least one symbol</p>
      </div>
      <br />
      <button id="sgnbtn" onClick={handleSignup}>Sign Up</button>
      <p className="already">
        Already have an account? <Link to="/login">Log In</Link>
      </p>
      
    </div>
    
  );
}

export default Signup;
