// frontend/src/pages/ContactPage.jsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import styles from '../styles/ContactPage.module.css';
import mapPlaceholder from '../assets/map_placeholder.png';

function ContactPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ 
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    message: '' 
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { theme } = useTheme();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await API.post('/messages', {
        name: formData.name,
        email: formData.email,
        subject: formData.subject || 'No Subject',
        message: formData.message
      });

      setSubmitted(true);
      
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ 
          name: user?.name || '', 
          email: user?.email || '', 
          subject: '', 
          message: '' 
        });
        setLoading(false);
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.page} ${theme === 'dark' ? styles.darkMode : ''}`}>
      <div className={styles.container}>
        {/* Header Section */}
        <div className={styles.header}>
          <h1 className={styles.title}>
            Get In Touch
            <span>Let's dance together</span>
          </h1>
          <div className={styles.headerDecoration}>
            <span className={styles.line}></span>
            <div className={styles.headerIcons}>
              <span>💃</span>
              <span>📞</span>
              <span>🕺</span>
              <span>✉️</span>
              <span>💃</span>
            </div>
            <span className={styles.line}></span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className={styles.contentGrid}>
          {/* Left Column - Contact Info */}
          <div className={styles.infoColumn}>
            <div className={styles.infoCard}>
              <h2><span>Contact</span> Info</h2>
              
              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>📍</div>
                  <div className={styles.infoDetails}>
                    <strong>Location</strong>
                    <p>San Eugenio, Aringay, La Union</p>
                  </div>
                </div>
                
                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>📞</div>
                  <div className={styles.infoDetails}>
                    <strong>Phone</strong>
                    <p>09xxxxxxx8</p>
                  </div>
                </div>
                
                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>✉️</div>
                  <div className={styles.infoDetails}>
                    <strong>Email</strong>
                    <p>dxxxxxxxxxxx@gmail.com</p>
                  </div>
                </div>
                
                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>🕒</div>
                  <div className={styles.infoDetails}>
                    <strong>Studio Hours</strong>
                    <p>Mon-Fri: 9AM - 8PM</p>
                  </div>
                </div>
              </div>

              <div className={styles.socialSection}>
                <h3>Follow Me</h3>
                <div className={styles.socialLinks}>
                  <a href="#" className={styles.socialLink} aria-label="Facebook">📘</a>
                  <a href="#" className={styles.socialLink} aria-label="Instagram">📷</a>
                  <a href="#" className={styles.socialLink} aria-label="Twitter">🐦</a>
                  <a href="#" className={styles.socialLink} aria-label="TikTok">🎵</a>
                </div>
              </div>

              {!user && (
                <div className={styles.loginPrompt}>
                  <p>
                    <span>💃</span>
                    Already have an account? <Link to="/login">Login</Link> for faster messaging
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className={styles.formColumn}>
            <div className={styles.formCard}>
              <h2><span>Send</span> Message</h2>
              
              {error && (
                <div className={styles.errorMessage}>
                  <span>❌</span>
                  <span>{error}</span>
                </div>
              )}

              {!submitted ? (
                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Your Name</label>
                      <input 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        placeholder="Enter your name"
                        required 
                        readOnly={!!user}
                        className={user ? styles.readOnly : ''}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Email Address</label>
                      <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        placeholder="your@email.com" 
                        required 
                        readOnly={!!user}
                        className={user ? styles.readOnly : ''}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Subject</label>
                    <input 
                      type="text" 
                      name="subject" 
                      value={formData.subject} 
                      onChange={handleChange} 
                      placeholder="What is this about?"
                      required 
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Message</label>
                    <textarea 
                      name="message" 
                      rows="5" 
                      value={formData.message} 
                      onChange={handleChange} 
                      placeholder="Tell me about your dance journey..."
                      required 
                    />
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
                      'Send Message'
                    )}
                  </button>
                </form>
              ) : (
                <div className={styles.successMessage}>
                  <div className={styles.successAnimation}>💃 🕺 💃</div>
                  <h3>Thank You!</h3>
                  <p>Your message has been sent to the admin. They'll respond soon!</p>
                  <div className={styles.successAnimation}>🕺 💃 🕺</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className={styles.locationSection}>
          <div className={styles.locationHeader}>
            <h3><span>Studio</span> Location</h3>
            <div className={styles.locationLine}></div>
          </div>
          <div className={styles.mapWrapper}>
            <img 
              src={mapPlaceholder} 
              alt="Map showing dance studio location" 
              className={styles.mapImage} 
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>Contact: dxxxxxxxxxxx@gmail.com | Phone: 09xxxxxxx8</p>
          <p>&copy; 2026 My Dance Journey. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default ContactPage;