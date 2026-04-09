import React, { useState } from 'react';
import './OnboardingFlow.css';
import './LoanFlow.css';

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

function LoanKycPage({ onSubmit, onBack, purchaseAmount }) {
  const [formData, setFormData] = useState({ fullName: '', dob: '', panCard: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const nextErrors = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 3) {
      nextErrors.fullName = 'Enter your full name (at least 3 characters)';
    }

    if (!formData.dob) {
      nextErrors.dob = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      if (age < 18) {
        nextErrors.dob = 'You must be at least 18 years old to apply';
      } else if (age > 75) {
        nextErrors.dob = 'Age must not exceed 75 years';
      }
    }

    const pan = formData.panCard.trim().toUpperCase();
    if (!pan) {
      nextErrors.panCard = 'PAN card number is required';
    } else if (!PAN_REGEX.test(pan)) {
      nextErrors.panCard = 'Enter a valid PAN number (e.g. ABCDE1234F)';
    }

    return nextErrors;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    let nextValue = value;
    if (name === 'panCard') {
      nextValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
    }
    if (name === 'fullName') {
      nextValue = value.replace(/[^a-zA-Z\s.]/g, '');
    }
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    onSubmit({
      fullName: formData.fullName.trim(),
      dob: formData.dob,
      panCard: formData.panCard.trim().toUpperCase(),
    });
    setIsSubmitting(false);
  };

  return (
    <div className="flow-container">
      <div className="flow-card">
        <div className="loan-step-indicator">
          <span className="loan-step active">Identity</span>
          <span className="loan-step-sep">›</span>
          <span className="loan-step">Offer</span>
          <span className="loan-step-sep">›</span>
          <span className="loan-step">Agreement</span>
        </div>

        <div className="flow-header">
          <h1 className="flow-title">KYC Verification</h1>
          <p className="flow-subtitle">
            Verify your identity to apply for a loan of{' '}
            <strong>₹{purchaseAmount?.toLocaleString('en-IN') || '–'}</strong>
          </p>
        </div>

        <form className="flow-form" onSubmit={handleSubmit} noValidate>
          <div className="flow-group">
            <label className="flow-label" htmlFor="fullName">
              Full Name (as per PAN)
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              className={`flow-input ${errors.fullName ? 'flow-input-error' : ''}`}
              placeholder="e.g. Rajesh Kumar Sharma"
              value={formData.fullName}
              onChange={handleChange}
              aria-describedby={errors.fullName ? 'name-error' : undefined}
            />
            {errors.fullName && (
              <p id="name-error" className="flow-error" role="alert">
                {errors.fullName}
              </p>
            )}
          </div>

          <div className="flow-group">
            <label className="flow-label" htmlFor="dob">
              Date of Birth
            </label>
            <input
              id="dob"
              name="dob"
              type="date"
              className={`flow-input ${errors.dob ? 'flow-input-error' : ''}`}
              value={formData.dob}
              max={new Date().toISOString().split('T')[0]}
              onChange={handleChange}
              aria-describedby={errors.dob ? 'dob-error' : undefined}
            />
            {errors.dob && (
              <p id="dob-error" className="flow-error" role="alert">
                {errors.dob}
              </p>
            )}
          </div>

          <div className="flow-group">
            <label className="flow-label" htmlFor="panCard">
              PAN Card Number
            </label>
            <input
              id="panCard"
              name="panCard"
              type="text"
              className={`flow-input flow-otp-input ${errors.panCard ? 'flow-input-error' : ''}`}
              placeholder="ABCDE1234F"
              maxLength={10}
              value={formData.panCard}
              onChange={handleChange}
              aria-describedby={errors.panCard ? 'pan-error' : undefined}
            />
            {errors.panCard && (
              <p id="pan-error" className="flow-error" role="alert">
                {errors.panCard}
              </p>
            )}
          </div>

          <button className="flow-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Verifying KYC...' : 'Verify & Continue'}
          </button>
        </form>

        <div className="flow-actions">
          <button type="button" className="flow-link-btn" onClick={onBack}>
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoanKycPage;
