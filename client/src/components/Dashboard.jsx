import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css'; // We will create this file next

const Dashboard = () => {
    const [facultyData, setFacultyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Replace with your local machine's IP if testing from ESP32, or localhost for local browser testing
    const API_URL = 'https://facultyserver-lws4.onrender.com/api/location/latest'; 

    useEffect(() => {
        const fetchLocationData = async () => {
            try {
                const response = await axios.get(API_URL);
                setFacultyData(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch faculty data.');
                setLoading(false);
            }
        };

        // Fetch immediately on mount
        fetchLocationData();

        // Set up polling every 5 seconds to get live updates
        const intervalId = setInterval(fetchLocationData, 5000);

        // Cleanup interval on unmount
        return () => clearInterval(intervalId);
    }, []);

    if (loading) return <div className="loading-state">Loading Faculty Data...</div>;
    if (error) return <div className="error-state">{error}</div>;

    const getLatestFaculty = () => {
        if (facultyData.length === 0) return null;
        return facultyData.reduce((latest, current) => {
            return new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest;
        });
    }

    const latestFaculty = getLatestFaculty();

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">
                Current Faculty Location
            </h1>
            
            <div className="card-wrapper">
                {!latestFaculty ? (
                    <div className="empty-state">No faculty location data available yet.</div>
                ) : (
                    <div className="faculty-card">
                        <div className="card-header">
                            <div className="icon-container">
                                📍
                            </div>
                            <h2 className="faculty-name">{latestFaculty.facultyId}</h2>
                            <span className="status-badge">
                                <span className="status-dot"></span>
                                ACTIVE NOW
                            </span>
                        </div>
                        
                        <div className="card-body">
                            <div className="info-row">
                                <div className="info-icon wifi-icon">📶</div>
                                <div className="info-text">
                                    <p className="info-label">Current Location (WiFi)</p>
                                    <p className="info-value">{latestFaculty.wifiName}</p>
                                </div>
                            </div>
                            
                            <div className="info-row">
                                <div className="info-icon clock-icon">🕒</div>
                                <div className="info-text">
                                    <p className="info-label">Last Detected</p>
                                    <p className="info-value">
                                        {new Date(latestFaculty.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
