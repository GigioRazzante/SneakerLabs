// src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import PaginaInicial from './pages/PaginaInicial.jsx';
import PaginaInicialLog from './pages/PaginaInicialLog.jsx';
import PaginaCatalogo from './pages/PaginaCatalogo.jsx';
import PaginaCriarSneaker from './pages/PaginaCriarSneaker.jsx';
import PaginaPerfil from './pages/PaginaPerfil.jsx';
import PaginaLogin from './pages/PaginaLogin.jsx';
import PaginaCadastro from './pages/PaginaCadastro.jsx';

// Componente para gerenciar o background baseado na rota
function BackgroundHandler() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    console.log('📍 Rota atual:', path); // DEBUG
    
    // Páginas que devem ter fundo branco/cinza
    if (path === "/login" || path === "/cadastro" || path === "/") {
      console.log('🎯 Aplicando fundo branco para rota:', path);
      document.body.classList.add("no-bg");
    } else {
      console.log('🎨 Aplicando background da imagem para rota:', path);
      document.body.classList.remove("no-bg");
    }
  }, [location]);

  return null;
}

function App() {
  return (
    <Router>
      <BackgroundHandler />
      <Routes>
        {/* Rota Raiz: Página Inicial DESLOGADA (deve ter fundo branco) */}
        <Route path="/" element={<PaginaInicial />} /> 
        
        {/* Rotas de Autenticação (Sem Navbar) - devem ter fundo branco */}
        <Route path="/login" element={<PaginaLogin />} />
        <Route path="/cadastro" element={<PaginaCadastro />} />

        {/* Rotas Logadas - devem ter background da imagem */}
        <Route path="/home" element={<PaginaInicialLog />} />
        <Route path="/catalogo" element={<PaginaCatalogo />} />
        <Route path="/criar-sneaker" element={<PaginaCriarSneaker />} />
        <Route path="/perfil" element={<PaginaPerfil />} />
      </Routes>
    </Router>
  );
}

export default App;