import React, { useState } from 'react';
import './OnboardingFlow.css';

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

function CustomerDetailsPage({ onRequestOtp }) {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    gstin: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const nextErrors = {};
    const phoneDigits = formData.phoneNumber.replace(/\D/g, '');
    const normalizedGstin = formData.gstin.trim().toUpperCase();

    if (!phoneDigits) {
      nextErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[6-9][0-9]{9}$/.test(phoneDigits)) {
      nextErrors.phoneNumber = 'Enter a valid 10-digit mobile number';
    }

    if (!normalizedGstin) {
      nextErrors.gstin = 'GSTIN is required';
    } else if (!GSTIN_REGEX.test(normalizedGstin)) {
      nextErrors.gstin = 'Enter a valid GSTIN (e.g. 27ABCDE1234F1Z5)';
    }

    return nextErrors;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextValue =
      name === 'phoneNumber' ? value.replace(/\D/g, '').slice(0, 10) : value.toUpperCase().replace(/\s/g, '');

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 700));

    onRequestOtp({
      phoneNumber: formData.phoneNumber,
      gstin: formData.gstin.trim().toUpperCase(),
    });

    setIsSubmitting(false);
  };

  return (
    <div className="flow-container">
      <div className="flow-card">
        <div className="flow-header">
          <h1 className="flow-title">Customer Verification</h1>
          <p className="flow-subtitle">Enter phone number and GSTIN to request OTP</p>
        </div>

        <form className="flow-form" onSubmit={handleSubmit} noValidate>
          <div className="flow-group">
            <label className="flow-label" htmlFor="phoneNumber">
              Phone Number
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              inputMode="numeric"
              className={`flow-input ${errors.phoneNumber ? 'flow-input-error' : ''}`}
              placeholder="10-digit mobile number"
              value={formData.phoneNumber}
              onChange={handleChange}
              aria-describedby={errors.phoneNumber ? 'phone-error' : undefined}
            />
            {errors.phoneNumber && (
              <p id="phone-error" className="flow-error" role="alert">
                {errors.phoneNumber}
              </p>
            )}
          </div>

          <div className="flow-group">
            <label className="flow-label" htmlFor="gstin">
              GSTIN
            </label>
            <input
              id="gstin"
              name="gstin"
              type="text"
              className={`flow-input ${errors.gstin ? 'flow-input-error' : ''}`}
              placeholder="27ABCDE1234F1Z5"
              maxLength={15}
              value={formData.gstin}
              onChange={handleChange}
              aria-describedby={errors.gstin ? 'gstin-error' : undefined}
            />
            {errors.gstin && (
              <p id="gstin-error" className="flow-error" role="alert">
                {errors.gstin}
              </p>
            )}
          </div>

          <button className="flow-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Requesting OTP...' : 'Send OTP'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CustomerDetailsPage;
