import React, { useState } from 'react';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <div className="App">
      {isLoggedIn ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
