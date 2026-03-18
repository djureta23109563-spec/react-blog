// frontend/src/pages/RegisterPage.jsx

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import styles from '../styles/RegisterPage.module.css';

const RegisterPage = () => {
    const [form, setForm] = useState({ 
        name: '', 
        email: '', 
        password: '',
        birthday: '',
        skillLevel: '',
        agreeToPolicy: false
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ 
            ...form, 
            [name]: type === 'checkbox' ? checked : value 
        });
        
        if (name === 'password') {
            checkPasswordStrength(value);
        }
    };

    const checkPasswordStrength = (password) => {
        if (password.length === 0) {
            setPasswordStrength('');
        } else if (password.length < 6) {
            setPasswordStrength('weak');
        } else if (password.length < 10) {
            setPasswordStrength('medium');
        } else {
            setPasswordStrength('strong');
        }
    };

    const getStrengthText = () => {
        switch(passwordStrength) {
            case 'weak': return 'Weak';
            case 'medium': return 'Medium';
            case 'strong': return 'Strong';
            default: return '';
        }
    };

    const calculateAge = (birthday) => {
        const today = new Date();
        const birthDate = new Date(birthday);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Age validation
        if (!form.birthday) {
            setError('Please enter your birthday');
            return;
        }

        const age = calculateAge(form.birthday);
        if (age < 5) {
            setError('You must be at least 5 years old to register');
            return;
        }

        // Skill level validation
        if (!form.skillLevel) {
            setError('Please select your dance experience level');
            return;
        }

        // Policy agreement validation
        if (!form.agreeToPolicy) {
            setError('You must agree to the terms and policy');
            return;
        }

        setLoading(true);
        
        try {
            const { data } = await API.post('/auth/register', form);
            localStorage.setItem('token', data.token);
            setTimeout(() => {
                navigate('/home');
            }, 500);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
            setLoading(false);
        }
    };

    const hasMinLength = form.password.length >= 6;
    const hasLetter = /[a-zA-Z]/.test(form.password);
    const hasNumber = /[0-9]/.test(form.password);

    return (
        <div className={styles.registerPage}>
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.header}>
                        <h2>
                            Join the <span>Dance</span>
                        </h2>
                        <p>Become part of our community</p>
                        <div className={styles.danceEmoji}>💃 🕺 💃</div>
                    </div>

                    <div className={styles.formContainer}>
                        {error && (
                            <div className={styles.errorMsg}>
                                <span>❌</span>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.inputGroup}>
                                <span className={styles.inputIcon}>👤</span>
                                <input
                                    name='name'
                                    type='text'
                                    placeholder='Full name'
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <span className={styles.inputIcon}>📧</span>
                                <input
                                    name='email'
                                    type='email'
                                    placeholder='Email address'
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    className={styles.input}
                                />
                            </div>

                            {/* Birthday Field - New */}
                            <div className={styles.inputGroup}>
                                <span className={styles.inputIcon}>🎂</span>
                                <input
                                    name='birthday'
                                    type='date'
                                    value={form.birthday}
                                    onChange={handleChange}
                                    required
                                    className={`${styles.input} ${styles.dateInput}`}
                                    max={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <span className={styles.inputIcon}>🔒</span>
                                <input
                                    name='password'
                                    type='password'
                                    placeholder='Password'
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                    className={styles.input}
                                />
                            </div>

                            {form.password && (
                                <div className={styles.passwordStrength}>
                                    <div className={styles.strengthBar}>
                                        <div 
                                            className={`${styles.strengthFill} ${styles[passwordStrength]}`}
                                        ></div>
                                    </div>
                                    <span className={styles.strengthText}>
                                        {getStrengthText()}
                                    </span>
                                </div>
                            )}

                            {form.password && (
                                <ul className={styles.passwordRequirements}>
                                    <li className={hasMinLength ? styles.valid : styles.invalid}>
                                        <span className={styles.requirementIcon}>
                                            {hasMinLength ? '💃' : '○'}
                                        </span>
                                        At least 6 characters
                                    </li>
                                    <li className={hasLetter ? styles.valid : styles.invalid}>
                                        <span className={styles.requirementIcon}>
                                            {hasLetter ? '🕺' : '○'}
                                        </span>
                                        Contains a letter
                                    </li>
                                    <li className={hasNumber ? styles.valid : styles.invalid}>
                                        <span className={styles.requirementIcon}>
                                            {hasNumber ? '💃' : '○'}
                                        </span>
                                        Contains a number
                                    </li>
                                </ul>
                            )}

                            {/* Skill Level Selection - New */}
                            <div className={styles.skillSection}>
                                <label className={styles.skillLabel}>
                                    <span className={styles.skillIcon}>💪</span>
                                    Dance Experience Level
                                </label>
                                <div className={styles.skillOptions}>
                                    <label className={`${styles.skillOption} ${form.skillLevel === 'beginner' ? styles.selected : ''}`}>
                                        <input
                                            type="radio"
                                            name="skillLevel"
                                            value="beginner"
                                            checked={form.skillLevel === 'beginner'}
                                            onChange={handleChange}
                                            className={styles.radioInput}
                                        />
                                        <span className={styles.radioEmoji}>🐣</span>
                                        <span className={styles.radioLabel}>Beginner</span>
                                        <span className={styles.radioDesc}>Just starting out</span>
                                    </label>

                                    <label className={`${styles.skillOption} ${form.skillLevel === 'intermediate' ? styles.selected : ''}`}>
                                        <input
                                            type="radio"
                                            name="skillLevel"
                                            value="intermediate"
                                            checked={form.skillLevel === 'intermediate'}
                                            onChange={handleChange}
                                            className={styles.radioInput}
                                        />
                                        <span className={styles.radioEmoji}>🦊</span>
                                        <span className={styles.radioLabel}>Intermediate</span>
                                        <span className={styles.radioDesc}>Know the basics</span>
                                    </label>

                                    <label className={`${styles.skillOption} ${form.skillLevel === 'expert' ? styles.selected : ''}`}>
                                        <input
                                            type="radio"
                                            name="skillLevel"
                                            value="expert"
                                            checked={form.skillLevel === 'expert'}
                                            onChange={handleChange}
                                            className={styles.radioInput}
                                        />
                                        <span className={styles.radioEmoji}>🦅</span>
                                        <span className={styles.radioLabel}>Expert</span>
                                        <span className={styles.radioDesc}>Advanced dancer</span>
                                    </label>
                                </div>
                            </div>

                            {/* Policy Agreement - New */}
                            <label className={styles.policyCheckbox}>
                                <input
                                    type="checkbox"
                                    name="agreeToPolicy"
                                    checked={form.agreeToPolicy}
                                    onChange={handleChange}
                                    className={styles.checkboxInput}
                                />
                                <span className={styles.checkboxEmoji}>
                                    {form.agreeToPolicy ? '💃' : '🕺'}
                                </span>
                                <span className={styles.checkboxText}>
                                    I agree to the <Link to="/policy" className={styles.policyLink}>Terms of Service</Link> and <Link to="/privacy" className={styles.policyLink}>Privacy Policy</Link>
                                </span>
                            </label>

                            <button 
                                type='submit' 
                                className={styles.button}
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className={styles.buttonContent}>
                                        <div className={styles.spinner}></div>
                                        Creating Account...
                                    </div>
                                ) : (
                                    <div className={styles.buttonContent}>
                                        <span>Join the Dance</span>
                                        <span className={styles.buttonIcon}>💃</span>
                                    </div>
                                )}
                            </button>
                        </form>

                        <p className={styles.loginText}>
                            Already dancing with us?
                            <Link to='/login'>Sign in</Link>
                        </p>
                    </div>
                </div>

                <div className={styles.features}>
                    <div className={styles.feature}>
                        <span>💃</span> Create Posts
                    </div>
                    <div className={styles.feature}>
                        <span>🕺</span> Join Discussions
                    </div>
                    <div className={styles.feature}>
                        <span>✨</span> Share Your Story
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;