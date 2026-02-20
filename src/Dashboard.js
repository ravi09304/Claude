import React from 'react';
import './Dashboard.css';

function Dashboard({ user, onLogout }) {
  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="dashboard-icon">
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="40" rx="20" fill="#4f46e5" />
            <path
              d="M20 10C14.477 10 10 14.477 10 20s4.477 10 10 10 10-4.477 10-10S25.523 10 20 10zm0 4a3 3 0 110 6 3 3 0 010-6zm0 14c-3.333 0-6.294-1.706-8.077-4.306C13.94 21.857 16.88 21 20 21s6.06.857 8.077 2.694C26.294 26.294 23.333 28 20 28z"
              fill="white"
            />
          </svg>
        </div>
        <h1 className="dashboard-title">Welcome, {user?.name}!</h1>
        <p className="dashboard-subtitle">You have successfully signed in.</p>
        <p className="dashboard-email">{user?.email}</p>
        <button className="logout-btn" onClick={onLogout}>
          Sign out
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
