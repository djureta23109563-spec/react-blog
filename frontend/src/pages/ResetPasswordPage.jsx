// frontend/src/pages/ResetPasswordPage.jsx

import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import API from '../api/axios';
import styles from '../styles/ResetPasswordPage.module.css';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [verifying, setVerifying] = useState(true);
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

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await API.get(`/password/verify-token/${token}`);
        if (response.data.valid) {
          setValidToken(true);
        } else {
          setValidToken(false);
          setError('Invalid or expired reset link.');
        }
      } catch (err) {
        console.error('Token verification error:', err);
        setValidToken(false);
        setError('Invalid or expired reset link. Please request a new one.');
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);

    try {
      const response = await API.post(`/password/reset-password/${token}`, {
        password,
        confirmPassword
      });
      
      setMessage(response.data.message || 'Password reset successfully!');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className={`${styles.resetPage} ${isDarkMode ? styles.darkMode : ''}`}>
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>Verifying your request...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!validToken) {
    return (
      <div className={`${styles.resetPage} ${isDarkMode ? styles.darkMode : ''}`}>
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.errorContainer}>
              <div className={styles.errorIcon}>⚠️</div>
              <h2>Invalid Reset Link</h2>
              <p>{error || 'This password reset link is invalid or has expired.'}</p>
              <Link to="/forgot-password" className={styles.requestNewLink}>
                Request a new reset link
              </Link>
              <Link to="/login" className={styles.backLink}>
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.resetPage} ${isDarkMode ? styles.darkMode : ''}`}>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrapper}>
              <span className={styles.keyIcon}>🔑</span>
            </div>
            <h1>Reset Password</h1>
            <p>Create a new password for your account</p>
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
                <p className={styles.redirectMessage}>Redirecting to login page...</p>
              </div>
            )}

            {!message && (
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>New Password</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className={styles.input}
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  <p className={styles.hint}>Password must be at least 6 characters</p>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Confirm Password</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
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

export default ResetPasswordPage;