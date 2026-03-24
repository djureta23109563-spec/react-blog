// frontend/src/pages/MessagePage.jsx

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import styles from '../styles/MessagePage.module.css';

const MessagePage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await API.post('/messages', formData);
      setSuccess(response.data.message);
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        subject: '',
        message: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.messagePage}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Send a Message</h1>
          <p className={styles.subtitle}>
            Have a question, feedback, or just want to say hello? Send me a message!
          </p>
        </div>

        <div className={styles.content}>
          {/* Left side - Contact Info */}
          <div className={styles.infoSection}>
            <div className={styles.infoCard}>
              <h2 className={styles.infoTitle}>Get in Touch</h2>
              
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>📧</span>
                <div>
                  <strong>Email</strong>
                  <p>admin@dancefolio.com</p>
                </div>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>⏰</span>
                <div>
                  <strong>Response Time</strong>
                  <p>Within 24-48 hours</p>
                </div>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>💬</span>
                <div>
                  <strong>Quick Response</strong>
                  <p>For urgent matters, mention "URGENT" in subject</p>
                </div>
              </div>

              {!user && (
                <div className={styles.loginPrompt}>
                  <p>
                    <span>💃</span> Already have an account?{' '}
                    <a href="/login" className={styles.loginLink}>Login</a> for faster messaging
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Message Form */}
          <div className={styles.formSection}>
            <div className={styles.formCard}>
              <h2 className={styles.formTitle}>Send a Message</h2>

              {error && (
                <div className={styles.errorMsg}>
                  <span>❌</span> {error}
                </div>
              )}

              {success && (
                <div className={styles.successMsg}>
                  <span>✅</span> {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Your Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    required
                    className={styles.input}
                    readOnly={!!user}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    className={styles.input}
                    readOnly={!!user}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What is this about?"
                    required
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Write your message here..."
                    rows={6}
                    required
                    className={styles.textarea}
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
                    <>
                      <span>Send Message</span>
                      <span className={styles.buttonIcon}>💃</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagePage;