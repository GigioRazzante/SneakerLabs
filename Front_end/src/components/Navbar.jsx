// components/Navbar.jsx - ATUALIZADO
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log('Usuário deslogado!');
    navigate('/'); 
  };

  // Dados mockados do usuário (substitua pelos dados reais do seu contexto/API)
  const userData = {
    username: 'UsuarioSneakerLab',
    profileColor: '#FF9D00'
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
            <Link to="/estoque" className="nav-link">Estoque</Link> {/* NOVA ABA */}
          </li>
          <li>
            <Link to="/perfil" className="nav-link">Perfil</Link>
          </li>
        </ul>
        
        {/* Container para avatar e botão Sair */}
        <div className="navbar-user-section">
          {/* Avatar/Bolinha do usuário */}
          <Link to="/perfil" className="user-avatar-link">
            <div 
              className="user-avatar"
              style={{ backgroundColor: userData.profileColor }}
            >
              {userData.username.charAt(0).toUpperCase()}
            </div>
          </Link>
          
          {/* Botão Sair */}
          <button className="nav-button" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;