// frontend/src/components/Navbar.jsx

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import styles from '../styles/Navbar.module.css';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/home" className={styles.logo}>
          <span className={styles.logoIcon}>💃</span>
          DanceFolio
          <span className={styles.logoIcon}>🕺</span>
        </Link>

        <nav className={styles.nav}>
          <ul className={styles.navList}>
            {/* Home Link - NOW POINTS TO /HOME */}
            <li>
              <Link 
                to="/home" 
                className={location.pathname === '/home' ? styles.active : ''}
              >
                Home
              </Link>
            </li>
            
            {/* About Link */}
            <li>
              <Link 
                to="/about" 
                className={location.pathname === '/about' ? styles.active : ''}
              >
                About
              </Link>
            </li>

            {/* Contact Link */}
            <li>
              <Link 
                to="/contact" 
                className={location.pathname === '/contact' ? styles.active : ''}
              >
                Contact
              </Link>
            </li>

            {!user ? (
              /* Guest Links */
              <>
                <li>
                  <Link 
                    to="/login"
                    className={location.pathname === '/login' ? styles.active : ''}
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/register"
                    className={`${styles.signupLink} ${location.pathname === '/register' ? styles.active : ''}`}
                  >
                    Sign Up
                  </Link>
                </li>
              </>
            ) : (
              /* Logged-in User Links */
              <>
                <li>
                  <Link 
                    to="/create-post"
                    className={location.pathname === '/create-post' ? styles.active : ''}
                  >
                    Write
                  </Link>
                </li>
                
                {/* Admin Only Link */}
                {user.role === 'admin' && (
                  <li>
                    <Link 
                      to="/admin"
                      className={location.pathname === '/admin' ? styles.active : ''}
                    >
                      Admin
                    </Link>
                  </li>
                )}

                {/* User Menu Dropdown */}
                <li className={styles.userMenu}>
                  <button className={styles.userButton}>
                    <span className={styles.avatar}>
                      {user.profilePic ? (
                        <img src={`http://localhost:5000/uploads/${user.profilePic}`} alt={user.name} />
                      ) : (
                        user.name?.charAt(0).toUpperCase()
                      )}
                    </span>
                    <span className={styles.userName}>{user.name}</span>
                  </button>
                  
                  <div className={styles.dropdown}>
                    <Link to="/profile" className={styles.dropdownItem}>Profile</Link>
                    <button onClick={handleLogout} className={styles.dropdownItem}>Logout</button>
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
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;