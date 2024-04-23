import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import SignUp from "./Pages/SignUp";
import LogIn from "./Pages/LogIn";
import Layout from "./Pages/Layout";
import EthereumDetails from "./Pages/EthereumDetails";
import RolesSelection from "./Pages/RoleSelection";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />} />
          <Route path="/login" element={<LogIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/home" element={<Home />} />
          <Route path="/ethereum-details" element={<EthereumDetails />} />
          <Route path="/role-selection" element={<RolesSelection />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
