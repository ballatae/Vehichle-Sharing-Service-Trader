import React from "react";
import { Link } from "react-router-dom";

function Layout() {
  return (
    <div className="layout-div">
      <h1>Welcome to Our Application</h1>
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
