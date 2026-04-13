// frontend/src/components/Navbar.jsx

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useState, useEffect } from 'react';
import styles from '../styles/Navbar.module.css';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [avatarError, setAvatarError] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);

  // For Vite, use import.meta.env for backend URL
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  // Fetch fresh user data from API
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);
        setAvatarError(false);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Listen for profile updates
  useEffect(() => {
    // Fetch fresh data when component mounts
    fetchUserData();
    
    const handleUserUpdate = () => {
      console.log('Navbar: Profile updated, refreshing user data...');
      fetchUserData();
    };
    
    window.addEventListener('userDataUpdated', handleUserUpdate);
    
    return () => {
      window.removeEventListener('userDataUpdated', handleUserUpdate);
    };
  }, []);

  // Update currentUser when the auth user changes
  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get profile image URL with better error handling
  const getProfileImageUrl = () => {
    if (avatarError) return null;
    
    if (currentUser?.profilePic) {
      if (currentUser.profilePic.startsWith('http')) {
        return currentUser.profilePic;
      }
      return `${BACKEND_URL}/uploads/${currentUser.profilePic}`;
    }
    if (currentUser?.avatar) {
      if (currentUser.avatar.startsWith('http')) {
        return currentUser.avatar;
      }
      return `${BACKEND_URL}/uploads/${currentUser.avatar}`;
    }
    return null;
  };

  const profileImageUrl = getProfileImageUrl();
  const displayUser = currentUser || user;

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Custom Logo */}
        <Link to="/home" className={styles.logo}>
          <div className={styles.logoMark}>
            <svg className={styles.logoSvg} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M12 16 L20 12 L28 16 L20 28 Z" stroke="currentColor" strokeWidth="2" fill="none"/>
              <circle cx="20" cy="20" r="3" fill="currentColor"/>
              <path d="M20 12 L20 8 M20 32 L20 28" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 16 L8 14 M28 16 L32 14" stroke="currentColor" strokeWidth="2"/>
              <path d="M16 22 L14 26 M24 22 L26 26" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div className={styles.logoText}>
            <span className={styles.logoName}>DanceFolio</span>
            <span className={styles.logoTagline}>Movement & Expression</span>
          </div>
        </Link>

        {/* Navigation Menu */}
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            <li>
              <Link 
                to="/home" 
                className={`${styles.navLink} ${location.pathname === '/home' ? styles.active : ''}`}
              >
                <span className={styles.navIcon}>🏠</span>
                <span>Home</span>
              </Link>
            </li>
            
            <li>
              <Link 
                to="/about" 
                className={`${styles.navLink} ${location.pathname === '/about' ? styles.active : ''}`}
              >
                <span className={styles.navIcon}>📖</span>
                <span>About</span>
              </Link>
            </li>

            <li>
              <Link 
                to="/contact" 
                className={`${styles.navLink} ${location.pathname === '/contact' ? styles.active : ''}`}
              >
                <span className={styles.navIcon}>✉️</span>
                <span>Contact</span>
              </Link>
            </li>

            {!displayUser ? (
              /* Guest Links */
              <>
                <li>
                  <Link 
                    to="/login"
                    className={`${styles.navLink} ${location.pathname === '/login' ? styles.active : ''}`}
                  >
                    <span className={styles.navIcon}>🔐</span>
                    <span>Login</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/register"
                    className={`${styles.signupLink} ${location.pathname === '/register' ? styles.active : ''}`}
                  >
                    <span className={styles.navIcon}>✨</span>
                    <span>Sign Up</span>
                  </Link>
                </li>
              </>
            ) : (
              /* Logged-in User Links */
              <>
                <li>
                  <Link 
                    to="/create-post"
                    className={`${styles.navLink} ${location.pathname === '/create-post' ? styles.active : ''}`}
                  >
                    <span className={styles.navIcon}>✍️</span>
                    <span>Write</span>
                  </Link>
                </li>
                
                {/* Admin Only Link */}
                {displayUser.role === 'admin' && (
                  <li>
                    <Link 
                      to="/admin"
                      className={`${styles.navLink} ${location.pathname === '/admin' ? styles.active : ''}`}
                    >
                      <span className={styles.navIcon}>👑</span>
                      <span>Admin</span>
                    </Link>
                  </li>
                )}

                {/* User Menu Dropdown */}
                <li className={styles.userMenu}>
                  <button className={styles.userButton}>
                    <div className={styles.avatar}>
                      {profileImageUrl ? (
                        <img 
                          src={profileImageUrl} 
                          alt={displayUser.name}
                          onError={() => setAvatarError(true)}
                        /> 
                      ) : (
                        <span className={styles.avatarInitial}>{displayUser.name?.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <span className={styles.userName}>{displayUser.name?.split(' ')[0]}</span>
                    <span className={styles.dropdownArrow}>▼</span>
                  </button>
                  
                  <div className={styles.dropdown}>
                    <Link to="/profile" className={styles.dropdownItem}>
                      <span className={styles.dropdownIcon}>👤</span>
                      <span>Profile</span>
                    </Link>
                    <button onClick={handleLogout} className={styles.dropdownItem}>
                      <span className={styles.dropdownIcon}>🚪</span>
                      <span>Logout</span>
                    </button>
                  </div>
                </li>
              </>
            )}

            {/* Dark Mode Toggle */}
            <li>
              <button 
                onClick={toggleTheme} 
                className={styles.themeToggle}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <span className={styles.themeIcon}>☀️</span>
                ) : (
                  <span className={styles.themeIcon}>🌙</span>
                )}
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;