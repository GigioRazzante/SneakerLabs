import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const NavBarInicial = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    document.body.classList.toggle('menu-open-inicial', !isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenu(false);
    document.body.classList.remove('menu-open-inicial');
  };

  return (
    <>
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Rubik+Glitch&display=swap');
        
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1000;
          background-color: white;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 1rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }

        .navbar-logo-link {
          text-decoration: none;
          display: flex;
          align-items: center;
        }

        .logo-text-creative {
          font-family: 'Rubik Glitch', system-ui;
          font-size: 2.4rem;
          font-weight: 400;
          letter-spacing: 2px;
          background: linear-gradient(135deg, #000 0%, #333 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          transition: all 0.3s ease;
          text-shadow: 3px 3px 0px rgba(0,0,0,0.1);
        }
        
        .logo-text-creative:hover {
          transform: scale(1.05);
          text-shadow: 4px 4px 0px rgba(0,0,0,0.15);
        }
        
        .logo-text-colored {
          font-family: 'Rubik Glitch', system-ui;
          font-size: 2.4rem;
          font-weight: 400;
          letter-spacing: 2px;
          color: #FF9D00;
          transition: all 0.3s ease;
          text-shadow: 3px 3px 0px rgba(0,0,0,0.1);
        }
        
        .logo-text-colored:hover {
          transform: scale(1.05);
          text-shadow: 4px 4px 0px rgba(0,0,0,0.15);
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .nav-button-link {
          text-decoration: none;
        }

        .nav-button {
          background-color: transparent;
          color: #FF9D00;
          border: 1px solid #FF9D00;
          padding: 8px 16px;
          border-radius: 5px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
          white-space: nowrap;
        }

        .nav-button:hover {
          background-color: #FF9D00;
          color: #fff;
        }

        .nav-button.cadastro-button {
          background-color: #FF9D00;
          color: #fff;
          border: 1px solid #FF9D00;
        }
        
        .nav-button.cadastro-button:hover {
          background-color: #e08b00;
        }

        /* Botão Hamburger - Mobile */
        .hamburger-menu {
          display: none;
          flex-direction: column;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          gap: 4px;
        }

        .hamburger-menu span {
          width: 25px;
          height: 3px;
          background-color: #333;
          transition: all 0.3s ease;
          border-radius: 2px;
        }

        /* Menu Overlay */
        .menu-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 999;
        }

        /* ========== RESPONSIVIDADE ========== */

        /* Tablet (768px - 1024px) */
        @media (max-width: 1024px) {
          .navbar {
            padding: 1rem 1.5rem;
            gap: 1rem;
          }
        }

        /* Mobile Large (641px - 768px) */
        @media (max-width: 768px) {
          .navbar {
            padding: 1rem;
            flex-wrap: wrap;
          }

          .hamburger-menu {
            display: flex;
            order: 2;
            margin-left: auto;
          }

          .navbar-right {
            position: fixed;
            top: 100%;
            left: 0;
            width: 100%;
            background-color: white;
            flex-direction: column;
            padding: 2rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transform: translateY(-100%);
            opacity: 0;
            visibility: hidden;
            gap: 1rem;
            z-index: 1001;
            transition: all 0.3s ease;
          }

          .navbar-right--open {
            transform: translateY(0);
            opacity: 1;
            visibility: visible;
            top: 100%;
          }

          .nav-button-link {
            width: 100%;
          }
          
          .nav-button {
            width: 100%;
            max-width: 200px;
            padding: 10px 20px;
            font-size: 1rem;
          }

          .menu-overlay {
            display: block;
          }

          /* Animação do hamburger quando aberto */
          .navbar-right--open + .hamburger-menu span:nth-child(1) {
            transform: rotate(45deg) translate(6px, 6px);
          }

          .navbar-right--open + .hamburger-menu span:nth-child(2) {
            opacity: 0;
          }

          .navbar-right--open + .hamburger-menu span:nth-child(3) {
            transform: rotate(-45deg) translate(6px, -6px);
          }

          .logo-text-creative,
          .logo-text-colored {
            font-size: 2rem;
            letter-spacing: 1px;
          }
        }

        /* Mobile Small (até 640px) */
        @media (max-width: 640px) {
          .navbar {
            padding: 0.75rem 1rem;
          }

          .logo-text-creative,
          .logo-text-colored {
            font-size: 1.8rem;
          }

          .navbar-right {
            padding: 1.5rem;
          }

          .nav-button {
            padding: 8px 16px;
            font-size: 0.9rem;
          }
        }

        /* Mobile Extra Small (até 480px) */
        @media (max-width: 480px) {
          .navbar {
            padding: 0.5rem 0.75rem;
          }

          .logo-text-creative,
          .logo-text-colored {
            font-size: 1.6rem;
          }

          .navbar-right {
            padding: 1rem;
          }

          .nav-button {
            font-size: 0.9rem;
          }
        }

        /* Acessibilidade */
        .nav-button:focus,
        .hamburger-menu:focus,
        .navbar-logo-link:focus {
          outline: 2px solid #FF9D00;
          outline-offset: 2px;
        }

        /* Prevenir scroll quando menu mobile está aberto */
        body.menu-open-inicial {
          overflow: hidden;
        }
        `}
      </style>
      
      <nav className="navbar">
        <div className="navbar-left">
          <Link to="/" className="navbar-logo-link" onClick={closeMobileMenu}>
            <span className="logo-text-creative">Sneak</span>
            <span className="logo-text-colored">Lab</span>
          </Link>
        </div>

        {/* Hamburger Menu - Mobile */}
        <button 
          className="hamburger-menu"
          onClick={toggleMobileMenu}
          aria-label="Menu mobile"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Botões de Login/Cadastro */}
        <div className={`navbar-right ${isMobileMenuOpen ? 'navbar-right--open' : ''}`}>
          <Link to="/login" className="nav-button-link" onClick={closeMobileMenu}>
            <button className="nav-button">
              Login
            </button>
          </Link>
          
          <Link to="/cadastro" className="nav-button-link" onClick={closeMobileMenu}>
            <button className="nav-button cadastro-button">
              Cadastro
            </button>
          </Link>
        </div>

        {/* Overlay para mobile */}
        {isMobileMenuOpen && (
          <div 
            className="menu-overlay" 
            onClick={closeMobileMenu}
          />
        )}
      </nav>
    </>
  );
};

export default NavBarInicial;