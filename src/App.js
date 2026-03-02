import React, { useState } from 'react';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';
import CustomerDetailsPage from './CustomerDetailsPage';
import GstCertificateUploadPage from './GstCertificateUploadPage';
import OtpVerificationPage from './OtpVerificationPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [gstCertificate, setGstCertificate] = useState(null);
  const [activeOtp, setActiveOtp] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleRequestOtp = ({ phoneNumber, gstin }) => {
    setCustomerData({ phoneNumber, gstin });
    setGstCertificate(null);
    setIsOtpVerified(false);
  };

  const handleGstUpload = (file) => {
    setGstCertificate(file);
    setActiveOtp(generateOtp());
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
    setGstCertificate(null);
    setActiveOtp('');
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setCustomerData(null);
    setGstCertificate(null);
    setActiveOtp('');
    setIsOtpVerified(false);
  };

  const hasSubmittedCustomerData = Boolean(customerData?.phoneNumber && customerData?.gstin);

  return (
    <div className="App">
      {!isLoggedIn ? (
        <LoginPage onLogin={handleLogin} />
      ) : !hasSubmittedCustomerData ? (
        <CustomerDetailsPage onRequestOtp={handleRequestOtp} />
      ) : !gstCertificate ? (
        <GstCertificateUploadPage
          onUpload={handleGstUpload}
          onBack={handleEditCustomerData}
        />
      ) : !isOtpVerified ? (
        <OtpVerificationPage
          phoneNumber={customerData.phoneNumber}
          demoOtp={activeOtp}
          onBack={() => setGstCertificate(null)}
          onResendOtp={handleResendOtp}
          onVerifyOtp={handleVerifyOtp}
        />
      ) : (
        <Dashboard
          user={{
            ...user,
            phoneNumber: customerData.phoneNumber,
            gstin: customerData.gstin,
          }}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;
