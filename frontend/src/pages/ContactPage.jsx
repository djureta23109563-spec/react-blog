// frontend/src/pages/ContactPage.jsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import styles from '../styles/ContactPage.module.css';
import mapPlaceholder from '../assets/map_placeholder.png';

function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const { theme } = useTheme();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', message: '' });
    }, 3000);
  };

  return (
    <div className={`${styles.page} ${theme === 'dark' ? styles['dark-mode'] : ''}`}>
      <div className={styles.container}>
        {/* Hero Section */}
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>
            Get In Touch
            <span>Let's dance together</span>
          </h1>
          <div className={styles.heroDance}>
            <span>💃</span>
            <span>📞</span>
            <span>🕺</span>
            <span>✉️</span>
            <span>💃</span>
          </div>
        </div>

        {/* Contact Grid */}
        <div className={styles.contactGrid}>
          {/* Contact Info */}
          <div className={styles.infoCard}>
            <h2><span>Contact</span> Info</h2>
            <div className={styles.contactInfo}>
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>📍</span>
                <div className={styles.infoText}>
                  <strong>Location</strong>
                  San Eugenio, Aringay, La Union
                </div>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>📞</span>
                <div className={styles.infoText}>
                  <strong>Phone</strong>
                  09xxxxxxx8
                </div>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>✉️</span>
                <div className={styles.infoText}>
                  <strong>Email</strong>
                  dxxxxxxxxxxx@gmail.com
                </div>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>🕒</span>
                <div className={styles.infoText}>
                  <strong>Studio Hours</strong>
                  Mon-Fri: 9AM - 8PM
                </div>
              </div>
            </div>
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialLink}>📘</a>
              <a href="#" className={styles.socialLink}>📷</a>
              <a href="#" className={styles.socialLink}>🐦</a>
              <a href="#" className={styles.socialLink}>🎵</a>
            </div>
          </div>

          {/* Contact Form */}
          <div className={styles.formCard}>
            <h2><span>Send</span> Message</h2>
            {!submitted ? (
              <form onSubmit={handleSubmit} className={styles.contactForm}>
                <div className={styles.formGroup}>
                  <label>Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    placeholder="Your name"
                    required 
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    placeholder="your@email.com" 
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

                <button type="submit" className={styles.submitButton}>
                  Send Message
                </button>
              </form>
            ) : (
              <div className={styles.successMsg}>
                <div className={styles.successDance}>💃🕺💃</div>
                <h3>Thank You!</h3>
                <p>Your message has been received. I'll dance my way back to you soon!</p>
                <div className={styles.successDance}>🕺💃🕺</div>
              </div>
            )}
          </div>
        </div>

        {/* Location */}
        <section className={styles.locationSection}>
          <h3><span>Studio</span> Location</h3>
          <img 
            src={mapPlaceholder} 
            alt="Map showing dance studio location" 
            className={styles.mapImage} 
          />
        </section>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>Contact: dxxxxxxxxxxx@gmail.com | Phone: 09xxxxxxx8</p>
        <p>&copy; 2026 My Dance Journey. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default ContactPage;