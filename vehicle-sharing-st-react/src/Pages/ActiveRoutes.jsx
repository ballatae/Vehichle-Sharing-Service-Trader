import React from "react";
import { useNavigate } from "react-router-dom";
import noRoutesAv from '../photos/noroutes.png';

function ActiveRoutes() {
  const navigate = useNavigate();

  const handleManualTest = () => {
    navigate("/manualTest");
  };

  return (
    <div className="active-routes-div">
      <div className="image-container">
        <img className="noActiveRoutesimg" src={noRoutesAv} alt="noRoutesAv" />
        <span className="hover-message">Too bad no active routes, but you can test our payment system through manual testing.</span>
      </div>
      <h1>No Active Routes</h1>
      <p>There are no active routes at the moment.</p>
      <button className="manual-test-button" onClick={handleManualTest}>
        Do Manual Test
      </button>
    </div>
  );
}

export default ActiveRoutes;
