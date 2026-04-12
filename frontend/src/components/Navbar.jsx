// frontend/src/components/Navbar.jsx

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import styles from '../styles/Navbar.module.css';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [avatarError, setAvatarError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');
  const [showDropdown, setShowDropdown] = useState(false);
  
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Load user data
  useEffect(() => {
    loadUserData();
    
    const handleUserUpdate = () => {
      loadUserData();
    };
    
    window.addEventListener('userDataUpdated', handleUserUpdate);
    
    return () => {
      window.removeEventListener('userDataUpdated', handleUserUpdate);
    };
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('Navbar loading - token exists:', !!token);
      
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      
      const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Navbar fetch response status:', response.status);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('Navbar loaded user:', userData.name, 'Role:', userData.role);
        setUser(userData);
        setAvatarError(false);
      } else {
        console.log('Token invalid, removing');
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const getProfileImageUrl = () => {
    if (avatarError) return null;
    
    if (user?.profilePic) {
      if (user.profilePic.startsWith('http')) return user.profilePic;
      return `${BACKEND_URL}/uploads/${user.profilePic}`;
    }
    if (user?.avatar) {
      if (user.avatar.startsWith('http')) return user.avatar;
      return `${BACKEND_URL}/uploads/${user.avatar}`;
    }
    return null;
  };

  const profileImageUrl = getProfileImageUrl();

  // Show loading state
  if (loading) {
    return (
      <header className={styles.header}>
        <div className={styles.container}>
          <Link to="/home" className={styles.logo}>
            <div className={styles.logoMark}>
              <svg className={styles.logoSvg} viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M12 16 L20 12 L28 16 L20 28 Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                <circle cx="20" cy="20" r="3" fill="currentColor"/>
              </svg>
            </div>
            <div className={styles.logoText}>
              <span className={styles.logoName}>DanceFolio</span>
              <span className={styles.logoTagline}>Movement & Expression</span>
            </div>
          </Link>
        </div>
      </header>
    );
  }

  console.log('Navbar rendering - user exists:', !!user, 'user role:', user?.role);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
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

        <nav className={styles.nav}>
          <ul className={styles.navList}>
            <li>
              <Link to="/home" className={`${styles.navLink} ${location.pathname === '/home' ? styles.active : ''}`}>
                <span className={styles.navIcon}>🏠</span>
                <span>Home</span>
              </Link>
            </li>
            <li>
              <Link to="/about" className={`${styles.navLink} ${location.pathname === '/about' ? styles.active : ''}`}>
                <span className={styles.navIcon}>📖</span>
                <span>About</span>
              </Link>
            </li>
            <li>
              <Link to="/contact" className={`${styles.navLink} ${location.pathname === '/contact' ? styles.active : ''}`}>
                <span className={styles.navIcon}>✉️</span>
                <span>Contact</span>
              </Link>
            </li>

            {!user ? (
              <>
                <li>
                  <Link to="/login" className={`${styles.navLink} ${location.pathname === '/login' ? styles.active : ''}`}>
                    <span className={styles.navIcon}>🔐</span>
                    <span>Login</span>
                  </Link>
                </li>
                <li>
                  <Link to="/register" className={`${styles.signupLink} ${location.pathname === '/register' ? styles.active : ''}`}>
                    <span className={styles.navIcon}>✨</span>
                    <span>Sign Up</span>
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/create-post" className={`${styles.navLink} ${location.pathname === '/create-post' ? styles.active : ''}`}>
                    <span className={styles.navIcon}>✍️</span>
                    <span>Write</span>
                  </Link>
                </li>
                
                {user.role === 'admin' && (
                  <li>
                    <Link to="/admin" className={`${styles.navLink} ${location.pathname === '/admin' ? styles.active : ''}`}>
                      <span className={styles.navIcon}>⚙️</span>
                      <span>Admin Dashboard</span>
                    </Link>
                  </li>
                )}

                <li className={styles.userMenu}>
                  <button 
                    className={styles.userButton}
                    onClick={() => setShowDropdown(!showDropdown)}
                    onMouseEnter={() => setShowDropdown(true)}
                    onMouseLeave={() => setShowDropdown(false)}
                  >
                    <div className={styles.avatar}>
                      {profileImageUrl ? (
                        <img src={profileImageUrl} alt={user.name} onError={() => setAvatarError(true)} /> 
                      ) : (
                        <span className={styles.avatarInitial}>{user.name?.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <span className={styles.userName}>{user.name?.split(' ')[0]}</span>
                    <span className={styles.dropdownArrow}>▼</span>
                  </button>
                  
                  <div 
                    className={styles.dropdown}
                    onMouseEnter={() => setShowDropdown(true)}
                    onMouseLeave={() => setShowDropdown(false)}
                  >
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

            <li>
              <button onClick={toggleTheme} className={styles.themeToggle} aria-label="Toggle theme">
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