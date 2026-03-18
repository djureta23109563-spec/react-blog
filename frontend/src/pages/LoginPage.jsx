// frontend/src/pages/LoginPage.jsx

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/LoginPage.module.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const user = await login(email, password);
      
      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/home');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h2>
              Welcome <span>Back</span>
            </h2>
            <p>Continue your dance journey</p>
            <div className={styles.danceEmoji}>💃 🕺 💃</div>
          </div>

          <div className={styles.formContainer}>
            {error && (
              <div className={styles.errorMsg}>
                <span>❌</span>
                {error}
              </div>
            )}

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <span className={styles.inputIcon}>📧</span>
                <input
                  type='email'
                  placeholder='Email address'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={styles.input}
                />
                <span className={styles.focusDance}>💃</span>
              </div>

              <div className={styles.inputGroup}>
                <span className={styles.inputIcon}>🔒</span>
                <input
                  type='password'
                  placeholder='Password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={styles.input}
                />
                <span className={styles.focusDance}>🕺</span>
              </div>

              <button 
                type='submit' 
                className={styles.button}
                disabled={loading}
              >
                {loading ? (
                  <div className={styles.buttonContent}>
                    <div className={styles.spinner}></div>
                    Signing in...
                  </div>
                ) : (
                  <div className={styles.buttonContent}>
                    <span className={styles.buttonIcon}>💃</span>
                    Sign In
                    <span className={styles.buttonIcon}>🕺</span>
                  </div>
                )}
              </button>
            </form>

            <p className={styles.registerLink}>
              New to the dance floor?
              <Link to='/register'>Join now</Link>
            </p>
          </div>
        </div>

        <div className={styles.features}>
          <div className={styles.feature}>
            <span>💃</span> Create Posts
          </div>
          <div className={styles.feature}>
            <span>🕺</span> Join Community
          </div>
          <div className={styles.feature}>
            <span>✨</span> Share Stories
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;