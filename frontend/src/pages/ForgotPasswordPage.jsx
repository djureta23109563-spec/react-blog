// frontend/src/pages/ForgotPasswordPage.jsx

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import styles from '../styles/ForgotPasswordPage.module.css';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState(1); // 1: email, 2: code, 3: reset password
  const [resetToken, setResetToken] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      setIsDarkMode(isDark);
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await API.post('/password/send-code', { email });
      setMessage(response.data.message || 'Verification code sent to your email!');
      setStep(2);
      
      // Start 60 second countdown for resend
      setCountdown(60);
    } catch (err) {
      console.error('Send code error:', err);
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await API.post('/password/verify-code', { email, code });
      setMessage('Code verified! Please enter your new password.');
      setResetToken(response.data.resetToken);
      setStep(3);
    } catch (err) {
      console.error('Verify code error:', err);
      setError(err.response?.data?.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const password = e.target.password.value;
    const confirmPassword = e.target.confirmPassword.value;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await API.post('/password/reset-password', {
        token: resetToken,
        password,
        confirmPassword
      });
      
      setMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      console.error('Reset error:', err);
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    if (countdown > 0) return;
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await API.post('/password/send-code', { email });
      setMessage('New verification code sent!');
      setCountdown(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.forgotPage} ${isDarkMode ? styles.darkMode : ''}`}>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrapper}>
              <span className={styles.lockIcon}>🔒</span>
            </div>
            <h1>
              {step === 1 && 'Forgot Password?'}
              {step === 2 && 'Enter Verification Code'}
              {step === 3 && 'Create New Password'}
            </h1>
            <p>
              {step === 1 && 'Enter your email to receive a verification code.'}
              {step === 2 && `We sent a 6-digit code to ${email}`}
              {step === 3 && 'Enter your new password below.'}
            </p>
          </div>

          <div className={styles.cardBody}>
            {error && (
              <div className={styles.alertError}>
                <span>❌</span>
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className={styles.alertSuccess}>
                <span>✅</span>
                <span>{message}</span>
              </div>
            )}

            {/* Step 1: Email Input */}
            {step === 1 && (
              <form onSubmit={handleSendCode} className={styles.form}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Email Address</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={styles.input}
                  />
                </div>
                <button type="submit" className={styles.submitButton} disabled={loading}>
                  {loading ? 'Sending...' : 'Send Verification Code'}
                </button>
              </form>
            )}

            {/* Step 2: Code Input */}
            {step === 2 && (
              <form onSubmit={handleVerifyCode} className={styles.form}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Verification Code</label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    required
                    className={styles.input}
                  />
                </div>
                <button type="submit" className={styles.submitButton} disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>
                <button 
                  type="button" 
                  onClick={resendCode} 
                  className={styles.resendButton}
                  disabled={countdown > 0}
                >
                  {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend Code'}
                </button>
              </form>
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
              <form onSubmit={handleResetPassword} className={styles.form}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>New Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter new password (min 6 characters)"
                    required
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm your new password"
                    required
                    className={styles.input}
                  />
                </div>
                <button type="submit" className={styles.submitButton} disabled={loading}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            )}

            <div className={styles.backToLogin}>
              <Link to="/login">← Back to Login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;