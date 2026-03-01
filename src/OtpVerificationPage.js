import React, { useEffect, useMemo, useState } from 'react';
import './OnboardingFlow.css';

function OtpVerificationPage({ phoneNumber, demoOtp, onBack, onResendOtp, onVerifyOtp }) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);
  const [resendInfo, setResendInfo] = useState('');

  useEffect(() => {
    if (resendCooldown <= 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const maskedPhoneNumber = useMemo(() => {
    if (!phoneNumber) {
      return '';
    }
    return phoneNumber.replace(/.(?=.{4})/g, '*');
  }, [phoneNumber]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!/^[0-9]{6}$/.test(otp)) {
      setError('Enter a valid 6-digit OTP');
      return;
    }

    setIsVerifying(true);
    setError('');
    await new Promise((resolve) => setTimeout(resolve, 500));

    const isValid = onVerifyOtp(otp);
    if (!isValid) {
      setError('Incorrect OTP. Please try again.');
    }

    setIsVerifying(false);
  };

  const handleResend = () => {
    if (resendCooldown > 0) {
      return;
    }
    onResendOtp();
    setOtp('');
    setError('');
    setResendInfo(`A new OTP has been sent to ${maskedPhoneNumber}`);
    setResendCooldown(30);
  };

  return (
    <div className="flow-container">
      <div className="flow-card">
        <div className="flow-header">
          <h1 className="flow-title">OTP Verification</h1>
          <p className="flow-subtitle">Enter the 6-digit OTP sent to {maskedPhoneNumber}</p>
        </div>

        <div className="flow-info-box" role="status">
          OTP sent successfully. Demo OTP: <strong>{demoOtp}</strong>
        </div>

        {resendInfo && (
          <div className="flow-success-box" role="status">
            {resendInfo}
          </div>
        )}

        <form className="flow-form" onSubmit={handleSubmit} noValidate>
          <div className="flow-group">
            <label className="flow-label" htmlFor="otp">
              Enter OTP
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              className={`flow-input flow-otp-input ${error ? 'flow-input-error' : ''}`}
              placeholder="6-digit OTP"
              value={otp}
              onChange={(event) => {
                setOtp(event.target.value.replace(/\D/g, '').slice(0, 6));
                if (error) {
                  setError('');
                }
              }}
              aria-describedby={error ? 'otp-error' : undefined}
            />
            {error && (
              <p id="otp-error" className="flow-error" role="alert">
                {error}
              </p>
            )}
          </div>

          <button className="flow-submit" type="submit" disabled={isVerifying}>
            {isVerifying ? 'Verifying OTP...' : 'Verify OTP'}
          </button>
        </form>

        <div className="flow-actions">
          <button type="button" className="flow-link-btn" onClick={onBack}>
            Edit phone/GSTIN
          </button>
          <button type="button" className="flow-link-btn" onClick={handleResend} disabled={resendCooldown > 0}>
            {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OtpVerificationPage;
