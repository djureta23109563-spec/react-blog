// src/components/NavBar.js
import { Link, useLocation } from 'react-router-dom';
import './NavBar.css'; // optional styling

function NavBar() {
  const location = useLocation();

  return (
    <header>
      <h1>My Personal Portfolio</h1>
      <nav>
        <ul>
          <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link></li>
          <li><Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>About</Link></li>
          <li><Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>Contact</Link></li>
          <li><Link to="/register" className={location.pathname === '/register' ? 'active' : ''}>Register</Link></li>
          <li><Link to="/game" className={location.pathname === '/game' ? 'active' : ''}>Game</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export default NavBar;