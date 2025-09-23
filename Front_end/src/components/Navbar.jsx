import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Aqui você pode adicionar lógica de logout, como remover tokens de autenticação
    console.log('Usuário deslogado!');
    navigate('/'); 
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/home" className="navbar-logo-link">
          <span className="logo-text-black">Sneak</span>
          <span className="logo-text-orange">Lab</span>
        </Link>
      </div>
      <div className="navbar-right">
        <ul className="navbar-links">
          <li>
            <Link to="/home" className="nav-link">Início</Link>
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
        <button className="nav-button" onClick={handleLogout}>
          Sair
        </button>
      </div>
    </nav>
  );
};

export default Navbar;