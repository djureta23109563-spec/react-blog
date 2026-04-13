// frontend/src/pages/ForgotPasswordPage.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import styles from '../styles/ForgotPasswordPage.module.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check for dark mode
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await API.post('/password/forgot-password', { email });
      setMessage(response.data.message || 'Check your email for password reset instructions.');
      setSubmitted(true);
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
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
            <h1>Forgot Password?</h1>
            <p>Enter your email address and we'll send you a link to reset your password.</p>
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

            {!submitted ? (
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Email Address</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={styles.input}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className={styles.spinner}></span>
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            ) : (
              <div className={styles.successMessage}>
                <p>We've sent a password reset link to:</p>
                <p className={styles.sentEmail}>{email}</p>
                <p>Please check your email and follow the instructions.</p>
              </div>
            )}

            <div className={styles.backToLogin}>
              <Link to="/login">
                ← Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;