import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { splitTextIntoSpans } from "./textSplit";

function Layout() {
   useEffect(() => {
    splitTextIntoSpans('.bubble-text');
   }, []);
  
  return (
    <div className="layout-div">
        <h1 class="bubble-text text">Vehicle Sharing Service Trader</h1>
      <div className="navigation-buttons">
        <Link to="/login">
          <button>Log In</button>
        </Link>
        <Link to="/signup">
          <button>Sign Up</button>
        </Link>
      </div>
    </div>
  );
}

export default Layout;
