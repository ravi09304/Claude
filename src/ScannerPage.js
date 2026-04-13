import React, { useCallback, useEffect, useRef, useState } from 'react';
import Tesseract from 'tesseract.js';
import './ScannerPage.css';

const STATUS = {
  IDLE: 'idle',
  PROCESSING: 'processing',
  DONE: 'done',
  ERROR: 'error',
};

function ScannerPage({ user, onBack, onLogout }) {
  const [imageFile, setImageFile] = useState(null);
  const [imageSrc, setImageSrc] = useState('');
  const [status, setStatus] = useState(STATUS.IDLE);
  const [progress, setProgress] = useState(0);
  const [parsedText, setParsedText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [copyState, setCopyState] = useState('idle');

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const previewUrlRef = useRef('');

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const applyImageFile = useCallback((file) => {
    if (!file) return;
    if (!file.type || !file.type.startsWith('image/')) {
      setErrorMessage('Please choose an image file (PNG, JPG, etc.).');
      setStatus(STATUS.ERROR);
      return;
    }

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;

    setImageFile(file);
    setImageSrc(url);
    setParsedText('');
    setProgress(0);
    setErrorMessage('');
    setStatus(STATUS.IDLE);
    setCopyState('idle');
  }, []);

  const handleFileInputChange = (e) => {
    const file = e.target.files && e.target.files[0];
    applyImageFile(file);
    e.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    applyImageFile(file);
  };

  const handleParse = async () => {
    if (!imageFile) return;
    setStatus(STATUS.PROCESSING);
    setProgress(0);
    setParsedText('');
    setErrorMessage('');

    try {
      const { data } = await Tesseract.recognize(imageFile, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round((m.progress || 0) * 100));
          }
        },
      });
      setParsedText(data.text || '');
      setStatus(STATUS.DONE);
      setProgress(100);
    } catch (err) {
      setErrorMessage(err && err.message ? err.message : 'Failed to parse image.');
      setStatus(STATUS.ERROR);
    }
  };

  const handleClear = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = '';
    }
    setImageFile(null);
    setImageSrc('');
    setParsedText('');
    setProgress(0);
    setErrorMessage('');
    setStatus(STATUS.IDLE);
    setCopyState('idle');
  };

  const handleCopy = async () => {
    if (!parsedText) return;
    try {
      await navigator.clipboard.writeText(parsedText);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 1500);
    } catch {
      setCopyState('error');
      setTimeout(() => setCopyState('idle'), 1500);
    }
  };

  const handleDownload = () => {
    if (!parsedText) return;
    const blob = new Blob([parsedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'parsed-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isProcessing = status === STATUS.PROCESSING;

  return (
    <div className="scanner-container">
      <div className="scanner-card">
        <header className="scanner-header">
          <button type="button" className="scanner-back-btn" onClick={onBack}>
            &larr; Back
          </button>
          <h1 className="scanner-title">Scan &amp; Parse</h1>
          <button type="button" className="scanner-logout-btn" onClick={onLogout}>
            Sign out
          </button>
        </header>

        <p className="scanner-subtitle">
          Upload, drop, or capture an image and extract the text from it.
        </p>
        {user && user.name && (
          <p className="scanner-greeting">Signed in as {user.name}</p>
        )}

        <div
          className={`scanner-dropzone ${isDragging ? 'is-dragging' : ''} ${imageSrc ? 'has-image' : ''}`}
          onDragOver={handleDragOver}
          onDragEnter={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {imageSrc ? (
            <img src={imageSrc} alt="Selected preview" className="scanner-preview" />
          ) : (
            <div className="scanner-dropzone-empty">
              <div className="scanner-dropzone-icon">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="6" y="10" width="36" height="28" rx="4" stroke="#4f46e5" strokeWidth="2.5" />
                  <circle cx="17" cy="20" r="3" fill="#4f46e5" />
                  <path d="M10 34l10-10 8 8 5-5 7 7" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="scanner-dropzone-text">
                Drag &amp; drop an image here, or choose an option below
              </p>
            </div>
          )}
        </div>

        <div className="scanner-actions">
          <button
            type="button"
            className="scanner-btn scanner-btn-secondary"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            disabled={isProcessing}
          >
            Choose image
          </button>
          <button
            type="button"
            className="scanner-btn scanner-btn-secondary"
            onClick={() => cameraInputRef.current && cameraInputRef.current.click()}
            disabled={isProcessing}
          >
            Use camera
          </button>
          <button
            type="button"
            className="scanner-btn scanner-btn-primary"
            onClick={handleParse}
            disabled={!imageFile || isProcessing}
          >
            {isProcessing ? 'Parsing…' : 'Parse text'}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="scanner-hidden-input"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileInputChange}
          className="scanner-hidden-input"
        />

        {isProcessing && (
          <div className="scanner-progress">
            <div className="scanner-progress-bar">
              <div
                className="scanner-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="scanner-progress-label">Recognizing text… {progress}%</span>
          </div>
        )}

        {status === STATUS.ERROR && errorMessage && (
          <div className="scanner-error">{errorMessage}</div>
        )}

        {(status === STATUS.DONE || parsedText) && (
          <div className="scanner-result">
            <div className="scanner-result-header">
              <h2 className="scanner-result-title">Extracted text</h2>
              <div className="scanner-result-actions">
                <button
                  type="button"
                  className="scanner-link-btn"
                  onClick={handleCopy}
                  disabled={!parsedText}
                >
                  {copyState === 'copied'
                    ? 'Copied!'
                    : copyState === 'error'
                    ? 'Copy failed'
                    : 'Copy'}
                </button>
                <button
                  type="button"
                  className="scanner-link-btn"
                  onClick={handleDownload}
                  disabled={!parsedText}
                >
                  Download .txt
                </button>
                <button type="button" className="scanner-link-btn" onClick={handleClear}>
                  Clear
                </button>
              </div>
            </div>
            <textarea
              className="scanner-textarea"
              value={parsedText}
              readOnly
              rows={10}
              placeholder="No text detected in this image."
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ScannerPage;
