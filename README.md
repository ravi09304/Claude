# React Login + Customer Verification Flow

A React application with:
- Login page
- Customer details form (Phone + GSTIN)
- OTP verification step
- Dashboard after successful verification

## Project Structure

```
Claude/
├── README.md
├── .gitignore
├── package.json
├── package-lock.json
├── public/
│   └── index.html
└── src/
    ├── index.js
    ├── index.css
    ├── App.js
    ├── LoginPage.js
    ├── LoginPage.css
    ├── CustomerDetailsPage.js
    ├── OtpVerificationPage.js
    ├── OnboardingFlow.css
    ├── Dashboard.js
    └── Dashboard.css
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

```bash
npm install
```

### Running the App

```bash
npm start
```

The app will be available at `http://localhost:3000/Claude`

### Build for Production

```bash
npm run build
```

## Features

- Login page with form validation
  - Email: `user@example.com`
  - Password: `password123`
- Customer details form after login
  - Validates Indian mobile number (10 digits, starts with 6-9)
  - Validates GSTIN format
- OTP verification page
  - Simulated OTP generation in frontend
  - Resend OTP with cooldown timer
- Dashboard view after successful OTP verification
- Responsive styling with CSS

## Tech Stack

- React 18
- Create React App
