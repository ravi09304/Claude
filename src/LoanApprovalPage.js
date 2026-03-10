import React from 'react';
import './LoanApprovalPage.css';

function LoanApprovalPage({ loanId, applicantName, loanAmount, productName, offer, onDone }) {
  const firstEmiDate = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  })();

  return (
    <div className="approval-container">
      <div className="approval-card">
        <div className="approval-hero">
          <div className="approval-checkmark">✓</div>
          <h1 className="approval-title">Loan Approved!</h1>
          <p className="approval-subtitle">
            Congratulations, <strong>{applicantName}</strong>! Your loan has been approved and the
            amount has been disbursed to the merchant.
          </p>
        </div>

        <div className="approval-loan-id">
          Loan Reference ID: <strong>{loanId}</strong>
        </div>

        <div className="approval-details">
          <div className="approval-detail-row">
            <span>Product Financed</span>
            <strong>{productName}</strong>
          </div>
          <div className="approval-detail-row">
            <span>Loan Amount</span>
            <strong>₹{loanAmount?.toLocaleString('en-IN')}</strong>
          </div>
          <div className="approval-detail-row">
            <span>Tenure</span>
            <strong>{offer?.months} months</strong>
          </div>
          <div className="approval-detail-row">
            <span>Monthly EMI</span>
            <strong>₹{offer?.emi?.toLocaleString('en-IN')}</strong>
          </div>
          <div className="approval-detail-row">
            <span>Interest Rate</span>
            <strong>{offer?.annualRate}% p.a.</strong>
          </div>
          <div className="approval-detail-row">
            <span>First EMI Date</span>
            <strong>{firstEmiDate}</strong>
          </div>
          <div className="approval-detail-row approval-detail-total">
            <span>Total Payable</span>
            <strong>₹{offer?.totalPayable?.toLocaleString('en-IN')}</strong>
          </div>
        </div>

        <div className="approval-next-steps">
          <p>📲 A repayment schedule has been sent to your registered mobile number.</p>
          <p>🏦 Set up your NACH mandate to ensure timely EMI deductions.</p>
        </div>

        <button className="approval-done-btn" type="button" onClick={onDone}>
          Done — Start New Application
        </button>
      </div>
    </div>
  );
}

export default LoanApprovalPage;
