// components/Navbar.jsx - ATUALIZADO COM RUBIK GLITCH
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { primaryColor } = useTheme();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    console.log('Usuário deslogado!');
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    document.body.classList.toggle('menu-open', !isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenu(false);
    document.body.classList.remove('menu-open');
  };

  // Dados do usuário real do contexto
  const userData = {
    username: user?.nome_usuario || 'Usuário',
    profileColor: user?.cor_perfil || primaryColor
  };

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Rubik+Glitch&display=swap');
          
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
            transition: all 0.3s ease;
            text-shadow: 3px 3px 0px rgba(0,0,0,0.1);
          }
          
          .logo-text-colored:hover {
            transform: scale(1.05);
            text-shadow: 4px 4px 0px rgba(0,0,0,0.15);
          }
          
          /* Ajuste para mobile */
          @media (max-width: 768px) {
            .logo-text-creative,
            .logo-text-colored {
              font-size: 2rem;
              letter-spacing: 1px;
            }
          }
          
          @media (max-width: 480px) {
            .logo-text-creative,
            .logo-text-colored {
              font-size: 1.8rem;
            }
          }
        `}
      </style>

      <nav className="navbar">
        <div className="navbar-left">
          <Link to="/home" className="navbar-logo-link" onClick={closeMobileMenu}>
            <span className="logo-text-creative">Sneak</span>
            <span 
              className="logo-text-colored"
              style={{ color: primaryColor }} // 🎨 COR DINÂMICA
            >
              Lab
            </span>
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

        {/* Navbar Right - Desktop & Mobile */}
        <div className={`navbar-right ${isMobileMenuOpen ? 'navbar-right--open' : ''}`}>
          <ul className="navbar-links">
            <li>
              <Link to="/home" className="nav-link" onClick={closeMobileMenu}>Início</Link>
            </li>
            <li>
              <Link to="/catalogo" className="nav-link" onClick={closeMobileMenu}>Catálogo</Link>
            </li>
            <li>
              <Link to="/criar-sneaker" className="nav-link" onClick={closeMobileMenu}>Criar Sneaker</Link>
            </li>
            <li>
              <Link to="/estoque" className="nav-link" onClick={closeMobileMenu}>Estoque</Link>
            </li>
            <li>
              <Link to="/perfil" className="nav-link" onClick={closeMobileMenu}>Perfil</Link>
            </li>
          </ul>
          
          {/* Container para avatar e botão Sair */}
          <div className="navbar-user-section">
            {/* Avatar/Bolinha do usuário */}
            <Link to="/perfil" className="user-avatar-link" onClick={closeMobileMenu}>
              <div 
                className="user-avatar"
                style={{ 
                  backgroundColor: userData.profileColor, // 🎨 COR DINÂMICA
                  borderColor: primaryColor // 🎨 COR DINÂMICA
                }}
              >
                {userData.username.charAt(0).toUpperCase()}
              </div>
            </Link>
            
            {/* Botão Sair */}
            <button 
              className="nav-button" 
              onClick={handleLogout}
              style={{ 
                borderColor: primaryColor, // 🎨 COR DINÂMICA
                color: primaryColor // 🎨 COR DINÂMICA
              }}
            >
              Sair
            </button>
          </div>
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

export default Navbar;