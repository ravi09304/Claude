import React, { useState, useRef } from 'react';
import './OnboardingFlow.css';

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

function GstCertificateUploadPage({ onUpload, onBack }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);

  const validateFile = (selected) => {
    if (!ALLOWED_TYPES.includes(selected.type)) {
      return 'Only PDF, JPG, or PNG files are allowed.';
    }
    if (selected.size > MAX_FILE_SIZE) {
      return 'File size must be under 5 MB.';
    }
    return '';
  };

  const handleFileSelect = (selected) => {
    const validationError = validateFile(selected);
    if (validationError) {
      setError(validationError);
      setFile(null);
    } else {
      setError('');
      setFile(selected);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setError('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please upload your GST certificate before continuing.');
      return;
    }
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    onUpload(file);
    setIsSubmitting(false);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flow-container">
      <div className="flow-card">
        <div className="flow-header">
          <h1 className="flow-title">Upload GST Certificate</h1>
          <p className="flow-subtitle">
            Please upload a valid GST certificate to proceed
          </p>
        </div>

        <form className="flow-form" onSubmit={handleSubmit} noValidate>
          {!file ? (
            <div
              className={`upload-dropzone ${isDragging ? 'upload-dropzone-active' : ''} ${error ? 'upload-dropzone-error' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => inputRef.current && inputRef.current.click()}
              role="button"
              tabIndex={0}
              aria-label="Click or drag and drop to upload GST certificate"
              onKeyDown={(e) => e.key === 'Enter' && inputRef.current && inputRef.current.click()}
            >
              <div className="upload-icon" aria-hidden="true">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p className="upload-hint-primary">
                {isDragging ? 'Drop file here' : 'Click or drag & drop to upload'}
              </p>
              <p className="upload-hint-secondary">
                Accepted: PDF, JPG, PNG &nbsp;&bull;&nbsp; Max 5 MB
              </p>
              <input
                ref={inputRef}
                type="file"
                accept={ALLOWED_EXTENSIONS.join(',')}
                className="upload-input-hidden"
                onChange={handleInputChange}
                aria-hidden="true"
                tabIndex={-1}
              />
            </div>
          ) : (
            <div className="upload-file-preview">
              <div className="upload-file-icon" aria-hidden="true">
                {file.type === 'application/pdf' ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                )}
              </div>
              <div className="upload-file-info">
                <span className="upload-file-name">{file.name}</span>
                <span className="upload-file-size">{formatSize(file.size)}</span>
              </div>
              <button
                type="button"
                className="upload-remove-btn"
                onClick={handleRemove}
                aria-label="Remove file"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )}

          {error && (
            <p className="flow-error" role="alert">
              {error}
            </p>
          )}

          <button className="flow-submit" type="submit" disabled={isSubmitting || !file}>
            {isSubmitting ? 'Uploading...' : 'Continue'}
          </button>
        </form>

        <div className="flow-actions">
          <button type="button" className="flow-link-btn" onClick={onBack}>
            &larr; Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default GstCertificateUploadPage;
