import React, { useState } from 'react';
import './PointOfPurchasePage.css';

function PointOfPurchasePage({ storeName, onProceed }) {
  const [formData, setFormData] = useState({ productName: '', purchaseAmount: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const nextErrors = {};
    if (!formData.productName.trim()) {
      nextErrors.productName = 'Product / item name is required';
    }
    const amount = parseFloat(formData.purchaseAmount);
    if (!formData.purchaseAmount) {
      nextErrors.purchaseAmount = 'Purchase amount is required';
    } else if (isNaN(amount) || amount < 1000) {
      nextErrors.purchaseAmount = 'Amount must be at least ₹1,000';
    } else if (amount > 1000000) {
      nextErrors.purchaseAmount = 'Amount cannot exceed ₹10,00,000';
    }
    return nextErrors;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextValue =
      name === 'purchaseAmount'
        ? value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
        : value;
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
    await new Promise((resolve) => setTimeout(resolve, 500));
    onProceed({
      productName: formData.productName.trim(),
      purchaseAmount: parseFloat(formData.purchaseAmount),
    });
    setIsSubmitting(false);
  };

  return (
    <div className="pop-container">
      <div className="pop-card">
        <div className="pop-store-badge">
          <span className="pop-store-icon">🏪</span>
          <span className="pop-store-name">{storeName || 'Store'}</span>
        </div>

        <div className="pop-header">
          <h1 className="pop-title">Point of Purchase</h1>
          <p className="pop-subtitle">Enter purchase details to initiate a customer loan application</p>
        </div>

        <div className="pop-highlight-box">
          <span className="pop-highlight-icon">💳</span>
          <div>
            <strong>In-Store EMI Financing</strong>
            <p>Customer pays via easy EMI — no paperwork at the counter</p>
          </div>
        </div>

        <form className="pop-form" onSubmit={handleSubmit} noValidate>
          <div className="pop-group">
            <label className="pop-label" htmlFor="productName">
              Product / Item Name
            </label>
            <input
              id="productName"
              name="productName"
              type="text"
              className={`pop-input ${errors.productName ? 'pop-input-error' : ''}`}
              placeholder="e.g. Samsung Galaxy S24, LED TV 55 inch"
              value={formData.productName}
              onChange={handleChange}
              aria-describedby={errors.productName ? 'product-error' : undefined}
            />
            {errors.productName && (
              <p id="product-error" className="pop-error" role="alert">
                {errors.productName}
              </p>
            )}
          </div>

          <div className="pop-group">
            <label className="pop-label" htmlFor="purchaseAmount">
              Purchase Amount (₹)
            </label>
            <div className="pop-input-prefix-wrap">
              <span className="pop-input-prefix">₹</span>
              <input
                id="purchaseAmount"
                name="purchaseAmount"
                type="text"
                inputMode="decimal"
                className={`pop-input pop-input-prefixed ${errors.purchaseAmount ? 'pop-input-error' : ''}`}
                placeholder="e.g. 25000"
                value={formData.purchaseAmount}
                onChange={handleChange}
                aria-describedby={errors.purchaseAmount ? 'amount-error' : undefined}
              />
            </div>
            {errors.purchaseAmount && (
              <p id="amount-error" className="pop-error" role="alert">
                {errors.purchaseAmount}
              </p>
            )}
          </div>

          <button className="pop-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : 'Initiate Loan Application →'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PointOfPurchasePage;
