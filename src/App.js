import React, { useState } from 'react';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';
import CustomerDetailsPage from './CustomerDetailsPage';
import OtpVerificationPage from './OtpVerificationPage';
import ScannerPage from './ScannerPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [activeOtp, setActiveOtp] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleRequestOtp = ({ phoneNumber, gstin }) => {
    setCustomerData({ phoneNumber, gstin });
    setActiveOtp(generateOtp());
    setIsOtpVerified(false);
  };

  const handleVerifyOtp = (otp) => {
    const isValid = otp === activeOtp;
    setIsOtpVerified(isValid);
    return isValid;
  };

  const handleResendOtp = () => {
    setActiveOtp(generateOtp());
  };

  const handleEditCustomerData = () => {
    setCustomerData(null);
    setActiveOtp('');
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setCustomerData(null);
    setActiveOtp('');
    setIsOtpVerified(false);
    setShowScanner(false);
  };

  const hasSubmittedCustomerData = Boolean(customerData?.phoneNumber && customerData?.gstin);

  return (
    <div className="App">
      {!isLoggedIn ? (
        <LoginPage onLogin={handleLogin} />
      ) : !hasSubmittedCustomerData ? (
        <CustomerDetailsPage onRequestOtp={handleRequestOtp} />
      ) : !isOtpVerified ? (
        <OtpVerificationPage
          phoneNumber={customerData.phoneNumber}
          demoOtp={activeOtp}
          onBack={handleEditCustomerData}
          onResendOtp={handleResendOtp}
          onVerifyOtp={handleVerifyOtp}
        />
      ) : showScanner ? (
        <ScannerPage
          user={{
            ...user,
            phoneNumber: customerData.phoneNumber,
            gstin: customerData.gstin,
          }}
          onBack={() => setShowScanner(false)}
          onLogout={handleLogout}
        />
      ) : (
        <Dashboard
          user={{
            ...user,
            phoneNumber: customerData.phoneNumber,
            gstin: customerData.gstin,
          }}
          onLogout={handleLogout}
          onOpenScanner={() => setShowScanner(true)}
        />
      )}
    </div>
  );
}

export default App;
