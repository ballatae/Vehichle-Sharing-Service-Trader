import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isTokenExpired, getToken } from '../utils/auth';

function RolesSelection() {
    const navigate = useNavigate();
    const location = useLocation();
    const { userId } = location.state || {};
    const token = getToken();

    useEffect(() => {
        if (isTokenExpired(token)) {
            console.error('Token has expired');
            alert("Session has expired. Please login again.");
            navigate('/login');
        }
    }, [token, navigate]);  // Dependencies include token and navigate to react on their changes

    const updateUserRole = async (role) => {
        console.log("Sending update role request for", role);
        try {
            const response = await fetch('http://localhost:3001/api/update-role', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId, role }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error('Failed to update role: ' + errorData.message);
            }

            const result = await response.json();
            console.log("Role update response:", result);
            alert(`Role set to ${role}`);
            navigate('/manualTest');
        } catch (error) {
            console.error('Error updating role:', error);
            alert('An error occurred while updating role: ' + error.message);
        }
    };

    return (
        <div>
            <h1>Are you a driver or a passenger?</h1>
            <button onClick={() => updateUserRole('driver')}>Driver</button>
            <button onClick={() => updateUserRole('passenger')}>Passenger</button>
        </div>
    );
}

export default RolesSelection;
