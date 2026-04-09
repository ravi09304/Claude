import React, { useState, useMemo } from 'react';
import './OnboardingFlow.css';
import './LoanFlow.css';

const LOAN_TENURES = [
  { months: 6, annualRate: 12 },
  { months: 12, annualRate: 14 },
  { months: 24, annualRate: 16 },
];

function calculateEmi(principal, annualRate, months) {
  const r = annualRate / 12 / 100;
  const emi = (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  return Math.ceil(emi);
}

function LoanOfferPage({ loanAmount, applicantName, onSelectOffer, onBack }) {
  const [selectedMonths, setSelectedMonths] = useState(null);

  const offers = useMemo(() => {
    return LOAN_TENURES.map(({ months, annualRate }) => {
      const processingFee = Math.round(loanAmount * 0.01);
      const emi = calculateEmi(loanAmount, annualRate, months);
      const totalPayable = emi * months;
      const totalInterest = totalPayable - loanAmount;
      return { months, annualRate, emi, totalPayable, totalInterest, processingFee };
    });
  }, [loanAmount]);

  const selectedOffer = offers.find((o) => o.months === selectedMonths);

  const handleProceed = () => {
    if (selectedOffer) onSelectOffer(selectedOffer);
  };

  return (
    <div className="flow-container">
      <div className="flow-card loan-offer-card-wide">
        <div className="loan-step-indicator">
          <span className="loan-step done">Identity ✓</span>
          <span className="loan-step-sep">›</span>
          <span className="loan-step active">Offer</span>
          <span className="loan-step-sep">›</span>
          <span className="loan-step">Agreement</span>
        </div>

        <div className="flow-header">
          <h1 className="flow-title">Choose Your Plan</h1>
          <p className="flow-subtitle">
            Loan amount: <strong>₹{loanAmount?.toLocaleString('en-IN')}</strong>
            {applicantName ? <> · {applicantName}</> : null}
          </p>
        </div>

        <div className="loan-offers-grid">
          {offers.map((offer) => (
            <button
              key={offer.months}
              type="button"
              className={`loan-offer-tile ${selectedMonths === offer.months ? 'loan-offer-tile-selected' : ''}`}
              onClick={() => setSelectedMonths(offer.months)}
              aria-pressed={selectedMonths === offer.months}
            >
              <div className="loan-offer-tenure">{offer.months} months</div>
              <div className="loan-offer-emi">
                <span className="loan-offer-emi-label">Monthly EMI</span>
                <span className="loan-offer-emi-amount">₹{offer.emi.toLocaleString('en-IN')}</span>
              </div>
              <div className="loan-offer-details">
                <span>{offer.annualRate}% p.a.</span>
                <span>Total: ₹{offer.totalPayable.toLocaleString('en-IN')}</span>
              </div>
              {selectedMonths === offer.months && (
                <div className="loan-offer-check">✓</div>
              )}
            </button>
          ))}
        </div>

        {selectedOffer && (
          <div className="flow-info-box loan-offer-summary">
            Processing fee: ₹{selectedOffer.processingFee.toLocaleString('en-IN')} (1% of loan amount, one-time) ·
            Interest charged: ₹{selectedOffer.totalInterest.toLocaleString('en-IN')}
          </div>
        )}

        <button
          className="flow-submit"
          type="button"
          disabled={!selectedMonths}
          onClick={handleProceed}
        >
          {selectedMonths
            ? `Proceed with ${selectedMonths}-Month Plan →`
            : 'Select a Plan to Continue'}
        </button>

        <div className="flow-actions">
          <button type="button" className="flow-link-btn" onClick={onBack}>
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoanOfferPage;
