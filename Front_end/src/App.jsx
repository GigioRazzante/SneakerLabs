// src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import FaviconManager from './components/FaviconManager.jsx';

import PaginaInicial from './pages/PaginaInicial.jsx';
import PaginaInicialLog from './pages/PaginaInicialLog.jsx';
import PaginaCatalogo from './pages/PaginaCatalogo.jsx';
import PaginaCriarSneaker from './pages/PaginaCriarSneaker.jsx';
import PaginaPerfil from './pages/PaginaPerfil.jsx';
import PaginaLogin from './pages/PaginaLogin.jsx';
import PaginaCadastro from './pages/PaginaCadastro.jsx';
import PaginaEstoque from './pages/PaginaEstoque.jsx';
import MeusPedidos from "./components/MeusPedidos.jsx";
import RastrearPedido from "./components/RastrearPedido.jsx";

function BackgroundHandler() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    
    if (
      path === "/login" || 
      path === "/cadastro" || 
      path === "/"
    ) {
      document.body.classList.add("no-bg");
    } else {
      document.body.classList.remove("no-bg");
    }
  }, [location]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <FaviconManager />
          <BackgroundHandler />
          <Routes>
            {/* Rota Raiz */}
            <Route path="/" element={<PaginaInicial />} /> 
            
            {/* Rotas de Autenticação */}
            <Route path="/login" element={<PaginaLogin />} />
            <Route path="/cadastro" element={<PaginaCadastro />} />

            {/* Rotas Logadas */}
            <Route path="/home" element={<PaginaInicialLog />} />
            <Route path="/catalogo" element={<PaginaCatalogo />} />
            <Route path="/criar-sneaker" element={<PaginaCriarSneaker />} />
            <Route path="/estoque" element={<PaginaEstoque />} />
            <Route path="/perfil" element={<PaginaPerfil />} />
            
            {/* Rota separada para Meus Pedidos */}
            <Route path="/meus-pedidos" element={<MeusPedidos />} />
            
            {/* Rota para Rastrear Pedido */}
            <Route path="/rastrear-pedido/:codigoRastreio" element={<RastrearPedido />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;