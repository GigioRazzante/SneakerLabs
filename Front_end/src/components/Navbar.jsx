// src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // Vamos criar este arquivo de CSS a seguir

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo-link">
          <span className="logo-text-black">Sneak</span>
          <span className="logo-text-orange">Lab</span>
        </Link>
      </div>
      <div className="navbar-right">
        <ul className="navbar-links">
          <li>
            <Link to="/" className="nav-link">Início</Link>
          </li>
          <li>
            <Link to="/catalogo" className="nav-link">Catálogo</Link>
          </li>
          <li>
            <Link to="/criar-sneaker" className="nav-link">Criar Sneaker</Link>
          </li>
          <li>
            <Link to="/perfil" className="nav-link">Perfil</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;