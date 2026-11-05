import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import layout2 from '../styles/layout2.module.css';
import buttons from '../styles/buttons.module.css';

// Shared layout for logged-in pages: a side menu on large screens,
// and a header with a hamburger menu that opens over the page on small screens
function AppLayout({ children, title, links }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (e) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    window.location.href = '/login';
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className={layout2.pageContainer}>
      <header className={layout2.mobileHeader}>
        <img src="/logo.png" alt="Comic Collective Logo" className={layout2.headerLogo} />
        <button
          type="button"
          className={layout2.menuButton}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="side-menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </header>
      {menuOpen && <div className={layout2.menuBackdrop} onClick={closeMenu} />}
      <div id="side-menu" className={`${layout2.leftPanel} ${menuOpen ? layout2.leftPanelOpen : ''}`}>
        <img src="/logo.png" alt="Comic Collective Logo" className={layout2.logo} />
        <nav className={layout2.menuNav}>
          {links.map(({ to, label }) => (
            <Link key={to} to={to} className={layout2.menuItem} onClick={closeMenu}>{label}</Link>
          ))}
        </nav>
        <div className={layout2.bottomNav}>
          <Link to="/settings" className={layout2.menuItem} onClick={closeMenu}>Settings</Link>
          <button onClick={handleLogout} className={buttons.logoutButton}>Log out</button>
        </div>
      </div>
      <div className={layout2.rightPanel}>
        {title && (
          <>
            <h1 className={layout2.pageHeader}>{title}</h1>
            <hr className={layout2.hr} />
          </>
        )}
        <div className={layout2.mainContent}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default AppLayout;
