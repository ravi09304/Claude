import React, { useState } from 'react';
import './OnboardingFlow.css';
import './LoanFlow.css';

function LoanAgreementPage({ loanAmount, offer, applicantName, panCard, onAccept, onBack }) {
  const [agreed, setAgreed] = useState({ terms: false, creditCheck: false, eMandate: false });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allAgreed = Object.values(agreed).every(Boolean);

  const firstEmiDate = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  })();

  const handleSubmit = async () => {
    if (!allAgreed) return;
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    onAccept();
    setIsSubmitting(false);
  };

  const checkboxItems = [
    { key: 'terms', label: 'I have read and agree to the Terms & Conditions and Privacy Policy' },
    { key: 'creditCheck', label: 'I authorise FinServ Lending to perform a credit bureau check on my behalf' },
    { key: 'eMandate', label: 'I consent to set up an e-Mandate / NACH for automatic EMI deduction' },
  ];

  return (
    <div className="flow-container">
      <div className="flow-card">
        <div className="loan-step-indicator">
          <span className="loan-step done">Identity ✓</span>
          <span className="loan-step-sep">›</span>
          <span className="loan-step done">Offer ✓</span>
          <span className="loan-step-sep">›</span>
          <span className="loan-step active">Agreement</span>
        </div>

        <div className="flow-header">
          <h1 className="flow-title">Loan Agreement</h1>
          <p className="flow-subtitle">Review and accept the loan terms to submit your application</p>
        </div>

        <div className="loan-summary-table">
          <div className="loan-summary-row">
            <span>Applicant</span>
            <strong>{applicantName}</strong>
          </div>
          <div className="loan-summary-row">
            <span>PAN Card</span>
            <strong>{panCard}</strong>
          </div>
          <div className="loan-summary-row">
            <span>Loan Amount</span>
            <strong>₹{loanAmount?.toLocaleString('en-IN')}</strong>
          </div>
          <div className="loan-summary-row">
            <span>Tenure</span>
            <strong>{offer?.months} months</strong>
          </div>
          <div className="loan-summary-row">
            <span>Interest Rate</span>
            <strong>{offer?.annualRate}% p.a. (fixed)</strong>
          </div>
          <div className="loan-summary-row">
            <span>Monthly EMI</span>
            <strong>₹{offer?.emi?.toLocaleString('en-IN')}</strong>
          </div>
          <div className="loan-summary-row">
            <span>Processing Fee</span>
            <strong>₹{offer?.processingFee?.toLocaleString('en-IN')}</strong>
          </div>
          <div className="loan-summary-row">
            <span>First EMI Date</span>
            <strong>{firstEmiDate}</strong>
          </div>
          <div className="loan-summary-row loan-summary-total">
            <span>Total Payable</span>
            <strong>₹{offer?.totalPayable?.toLocaleString('en-IN')}</strong>
          </div>
        </div>

        <div className="loan-tc-scroll">
          <h4>Terms &amp; Conditions</h4>
          <p>
            This loan is offered by FinServ Lending Pvt. Ltd. ("Lender") subject to the following terms. The loan
            amount shall be disbursed directly to the merchant upon approval. The applicant agrees to repay the loan
            via Equal Monthly Instalments (EMIs) as specified above. The interest rate is fixed for the entire tenure.
            Late payment charges of ₹500 or 2% of the overdue EMI (whichever is higher) will apply. Prepayment is
            permitted after 3 EMIs with a foreclosure charge of 2% of outstanding principal. The Lender reserves the
            right to report payment behaviour to credit bureaus (CIBIL, Equifax, Experian, CRIF). This agreement is
            governed by the laws of the Republic of India and subject to exclusive jurisdiction of courts in Mumbai.
          </p>
        </div>

        <div className="loan-checkboxes">
          {checkboxItems.map(({ key, label }) => (
            <label key={key} className="loan-checkbox-row">
              <input
                type="checkbox"
                className="loan-checkbox"
                checked={agreed[key]}
                onChange={(e) => setAgreed((prev) => ({ ...prev, [key]: e.target.checked }))}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>

        <button
          className="flow-submit"
          type="button"
          disabled={!allAgreed || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? 'Submitting Application...' : 'Accept & Submit Application'}
        </button>

        <div className="flow-actions">
          <button
            type="button"
            className="flow-link-btn"
            onClick={onBack}
            disabled={isSubmitting}
          >
            ← Change Plan
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoanAgreementPage;
