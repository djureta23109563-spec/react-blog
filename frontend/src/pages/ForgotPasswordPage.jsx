import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import styles from '../styles/ForgotPasswordPage.module.css';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await API.post('/auth/forgot-password', { email });
            setMessage(response.data.message);
            setSubmitted(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.successIcon}>📧</div>
                    <h2>Check Your Email</h2>
                    <p>
                        We've sent a password reset link to <strong>{email}</strong>
                    </p>
                    <p className={styles.instruction}>
                        Click the link in the email to reset your password. The link will expire in 1 hour.
                    </p>
                    <Link to="/login" className={styles.backButton}>
                        Back to Login
                    </Link>
                    <button 
                        onClick={() => setSubmitted(false)} 
                        className={styles.resendButton}
                    >
                        Didn't receive email? Try again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h2>Forgot Password?</h2>
                    <p>Enter your email address and we'll send you a link to reset your password.</p>
                </div>

                {error && (
                    <div className={styles.errorAlert}>
                        <span>⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                {message && (
                    <div className={styles.successAlert}>
                        <span>✅</span>
                        <span>{message}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            required
                            disabled={loading}
                        />
                    </div>

                    <button 
                        type="submit" 
                        className={styles.submitButton}
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPasswordPage;