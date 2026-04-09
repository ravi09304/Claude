import React, { useState } from 'react';
import LoginPage from './LoginPage';
import PointOfPurchasePage from './PointOfPurchasePage';
import CustomerDetailsPage from './CustomerDetailsPage';
import OtpVerificationPage from './OtpVerificationPage';
import LoanKycPage from './LoanKycPage';
import LoanOfferPage from './LoanOfferPage';
import LoanAgreementPage from './LoanAgreementPage';
import LoanApprovalPage from './LoanApprovalPage';

const STEPS = {
  LOGIN: 'login',
  POINT_OF_PURCHASE: 'pointOfPurchase',
  CUSTOMER_DETAILS: 'customerDetails',
  OTP_VERIFICATION: 'otpVerification',
  LOAN_KYC: 'loanKyc',
  LOAN_OFFER: 'loanOffer',
  LOAN_AGREEMENT: 'loanAgreement',
  LOAN_APPROVAL: 'loanApproval',
};

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));
const generateLoanId = () => 'LN' + Date.now().toString().slice(-8);

function App() {
  const [step, setStep] = useState(STEPS.LOGIN);
  const [user, setUser] = useState(null);
  const [purchaseData, setPurchaseData] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [activeOtp, setActiveOtp] = useState('');
  const [kycData, setKycData] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [loanId] = useState(generateLoanId);

  const handleLogin = (userData) => {
    setUser(userData);
    setStep(STEPS.POINT_OF_PURCHASE);
  };

  const handlePurchaseSubmit = (data) => {
    setPurchaseData(data);
    setStep(STEPS.CUSTOMER_DETAILS);
  };

  const handleRequestOtp = ({ phoneNumber, gstin }) => {
    setCustomerData({ phoneNumber, gstin });
    setActiveOtp(generateOtp());
    setStep(STEPS.OTP_VERIFICATION);
  };

  const handleVerifyOtp = (otp) => {
    const isValid = otp === activeOtp;
    if (isValid) setStep(STEPS.LOAN_KYC);
    return isValid;
  };

  const handleResendOtp = () => {
    setActiveOtp(generateOtp());
  };

  const handleBackFromOtp = () => {
    setCustomerData(null);
    setActiveOtp('');
    setStep(STEPS.CUSTOMER_DETAILS);
  };

  const handleKycSubmit = (data) => {
    setKycData(data);
    setStep(STEPS.LOAN_OFFER);
  };

  const handleOfferSelect = (offer) => {
    setSelectedOffer(offer);
    setStep(STEPS.LOAN_AGREEMENT);
  };

  const handleAgreementAccept = () => {
    setStep(STEPS.LOAN_APPROVAL);
  };

  const handleReset = () => {
    setPurchaseData(null);
    setCustomerData(null);
    setActiveOtp('');
    setKycData(null);
    setSelectedOffer(null);
    setStep(STEPS.POINT_OF_PURCHASE);
  };

  return (
    <div className="App">
      {step === STEPS.LOGIN && (
        <LoginPage onLogin={handleLogin} />
      )}

      {step === STEPS.POINT_OF_PURCHASE && (
        <PointOfPurchasePage
          storeName={user?.name || user?.email}
          onProceed={handlePurchaseSubmit}
        />
      )}

      {step === STEPS.CUSTOMER_DETAILS && (
        <CustomerDetailsPage
          purchaseAmount={purchaseData?.purchaseAmount}
          onRequestOtp={handleRequestOtp}
          onBack={() => setStep(STEPS.POINT_OF_PURCHASE)}
        />
      )}

      {step === STEPS.OTP_VERIFICATION && (
        <OtpVerificationPage
          phoneNumber={customerData?.phoneNumber}
          demoOtp={activeOtp}
          onBack={handleBackFromOtp}
          onResendOtp={handleResendOtp}
          onVerifyOtp={handleVerifyOtp}
        />
      )}

      {step === STEPS.LOAN_KYC && (
        <LoanKycPage
          purchaseAmount={purchaseData?.purchaseAmount}
          onSubmit={handleKycSubmit}
          onBack={() => setStep(STEPS.OTP_VERIFICATION)}
        />
      )}

      {step === STEPS.LOAN_OFFER && (
        <LoanOfferPage
          loanAmount={purchaseData?.purchaseAmount}
          applicantName={kycData?.fullName}
          onSelectOffer={handleOfferSelect}
          onBack={() => setStep(STEPS.LOAN_KYC)}
        />
      )}

      {step === STEPS.LOAN_AGREEMENT && (
        <LoanAgreementPage
          loanAmount={purchaseData?.purchaseAmount}
          offer={selectedOffer}
          applicantName={kycData?.fullName}
          panCard={kycData?.panCard}
          onAccept={handleAgreementAccept}
          onBack={() => setStep(STEPS.LOAN_OFFER)}
        />
      )}

      {step === STEPS.LOAN_APPROVAL && (
        <LoanApprovalPage
          loanId={loanId}
          applicantName={kycData?.fullName}
          loanAmount={purchaseData?.purchaseAmount}
          productName={purchaseData?.productName}
          offer={selectedOffer}
          onDone={handleReset}
        />
      )}
    </div>
  );
}

export default App;
