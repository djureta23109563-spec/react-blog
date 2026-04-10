import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import styles from '../styles/ResetPasswordPage.module.css';

const ResetPasswordPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [validToken, setValidToken] = useState(false);
    const [checkingToken, setCheckingToken] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        verifyToken();
    }, [token]);

    const verifyToken = async () => {
        try {
            const response = await API.get(`/auth/verify-token/${token}`);
            if (response.data.valid) {
                setValidToken(true);
            } else {
                setValidToken(false);
                setError('Invalid or expired reset link');
            }
        } catch (err) {
            setValidToken(false);
            setError('Invalid or expired reset link');
        } finally {
            setCheckingToken(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        
        setLoading(true);
        setError('');
        setMessage('');
        
        try {
            const response = await API.post(`/auth/reset-password/${token}`, {
                password,
                confirmPassword
            });
            
            setMessage(response.data.message);
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
            
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    if (checkingToken) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.spinner}></div>
                    <p>Verifying your reset link...</p>
                </div>
            </div>
        );
    }

    if (!validToken) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.errorIcon}>🔗</div>
                    <h2>Invalid or Expired Link</h2>
                    <p>This password reset link is invalid or has expired.</p>
                    <Link to="/forgot-password" className={styles.button}>
                        Request New Reset Link
                    </Link>
                    <Link to="/login" className={styles.backLink}>
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    if (message) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.successIcon}>✅</div>
                    <h2>Password Reset Successful!</h2>
                    <p>{message}</p>
                    <p className={styles.redirect}>Redirecting to login page...</p>
                    <Link to="/login" className={styles.button}>
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h2>Create New Password</h2>
                    <p>Enter your new password below.</p>
                </div>

                {error && (
                    <div className={styles.errorAlert}>
                        <span>⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label>New Password</label>
                        <div className={styles.passwordWrapper}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter new password (min 6 characters)"
                                required
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className={styles.toggleButton}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Confirm Password</label>
                        <div className={styles.passwordWrapper}>
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your new password"
                                required
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className={styles.toggleButton}
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className={styles.submitButton}
                        disabled={loading}
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>

                    <div className={styles.footer}>
                        <Link to="/login" className={styles.backLink}>
                            ← Back to Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;