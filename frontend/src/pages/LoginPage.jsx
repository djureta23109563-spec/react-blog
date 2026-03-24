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
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const user = await login(email, password);
      
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
      <div className={styles.background}>
        <div className={styles.bgPattern}></div>
      </div>
      
      <div className={styles.container}>
        <div className={styles.contentGrid}>
          {/* Left Column - Welcome Section */}
          <div className={styles.welcomeSection}>
            <div className={styles.welcomeContent}>
              <h1 className={styles.welcomeTitle}>
                DanceFolio
                <span>Join the rhythm</span>
              </h1>
              <p className={styles.welcomeText}>
                Connect with dancers, share your journey, and be part of a growing community passionate about movement and expression.
              </p>
              
              <div className={styles.testimonial}>
                <div className={styles.testimonialQuote}>"</div>
                <p className={styles.testimonialText}>
                  This community has helped me grow as a dancer and connect with amazing people.
                </p>
                <div className={styles.testimonialAuthor}>
                  <span className={styles.authorName}>Maria S.</span>
                  <span className={styles.authorRole}>Dancer</span>
                </div>
              </div>

              <div className={styles.stats}>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>500+</span>
                  <span className={styles.statLabel}>Active Dancers</span>
                </div>
                <div className={styles.statDivider}></div>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>1000+</span>
                  <span className={styles.statLabel}>Stories Shared</span>
                </div>
                <div className={styles.statDivider}></div>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>50+</span>
                  <span className={styles.statLabel}>Workshops</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Login Form */}
          <div className={styles.formSection}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>Welcome Back</h2>
                <p>Sign in to continue your dance journey</p>
                <div className={styles.headerDecoration}>
                  <span className={styles.decorationLine}></span>
                  <span className={styles.decorationIcon}>💃</span>
                  <span className={styles.decorationLine}></span>
                </div>
              </div>

              <div className={styles.cardBody}>
                {error && (
                  <div className={styles.alertError}>
                    <span className={styles.alertIcon}>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                <form className={styles.form} onSubmit={handleSubmit}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      <span className={styles.labelIcon}>📧</span>
                      Email Address
                    </label>
                    <div className={styles.inputWrapper}>
                      <input
                        type='email'
                        placeholder='your@email.com'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className={styles.input}
                      />
                      <span className={styles.inputFocus}></span>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      <span className={styles.labelIcon}>🔒</span>
                      Password
                    </label>
                    <div className={styles.inputWrapper}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder='Enter your password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className={styles.input}
                      />
                      <button
                        type="button"
                        className={styles.passwordToggle}
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                      <span className={styles.inputFocus}></span>
                    </div>
                  </div>

                  <div className={styles.formOptions}>
                    <label className={styles.rememberMe}>
                      <input type="checkbox" className={styles.checkbox} />
                      <span className={styles.checkboxLabel}>Remember me</span>
                    </label>
                    <Link to="/forgot-password" className={styles.forgotLink}>
                      Forgot password?
                    </Link>
                  </div>

                  <button 
                    type='submit' 
                    className={styles.submitButton}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className={styles.spinner}></span>
                        Signing in...
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <span className={styles.buttonIcon}>→</span>
                      </>
                    )}
                  </button>
                </form>

                <div className={styles.registerPrompt}>
                  <p>
                    New to DanceFolio? <Link to='/register' className={styles.registerLink}>Create an account</Link>
                  </p>
                </div>

                <div className={styles.demoCredentials}>
                  <p className={styles.demoTitle}>Demo Credentials:</p>
                  <div className={styles.demoGrid}>
                    <div className={styles.demoItem}>
                      <span className={styles.demoRole}>Admin</span>
                      <span className={styles.demoEmail}>admin@dancefolio.com</span>
                      <span className={styles.demoPass}>Admin@1234</span>
                    </div>
                    <div className={styles.demoItem}>
                      <span className={styles.demoRole}>Member</span>
                      <span className={styles.demoEmail}>member@dancefolio.com</span>
                      <span className={styles.demoPass}>Member@1234</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <p>By signing in, you agree to our</p>
                <div className={styles.footerLinks}>
                  <Link to="/terms">Terms of Service</Link>
                  <span className={styles.separator}>•</span>
                  <Link to="/privacy">Privacy Policy</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;