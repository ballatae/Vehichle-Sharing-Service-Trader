import React, { useState, useEffect } from 'react';

function ManualControls({ sendEthersToContract }) {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  useEffect(() => {
  const fetchDrivers = async () => {
    try {
      const response = await fetch('/api/drivers');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setDrivers(data);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  };

  fetchDrivers();
}, []);


  function handleDriverChange(event) {
    setSelectedDriver(event.target.value);
  }

  function handleLatitudeChange(event) {
    setLatitude(event.target.value);
  }

  function handleLongitudeChange(event) {
    setLongitude(event.target.value);
  }

  function handleTransaction() {
    const driver = drivers.find(d => d.username === selectedDriver);
    if (!driver) return;
    sendEthersToContract(driver.ethereumAddress, { lat: latitude, lng: longitude }); // Adjust transaction call as needed
  }

  return (
    <div>
      <select value={selectedDriver} onChange={handleDriverChange}>
        <option value="">Select a driver</option>
        {drivers.map((driver) => (
          <option key={driver._id} value={driver.username}>{driver.username}</option>
        ))}
      </select>
      <input type="text" placeholder="Latitude" value={latitude} onChange={handleLatitudeChange} />
      <input type="text" placeholder="Longitude" value={longitude} onChange={handleLongitudeChange} />
      <button onClick={handleTransaction}>Send ETH to Driver</button>
    </div>
  );
}

export default ManualControls;