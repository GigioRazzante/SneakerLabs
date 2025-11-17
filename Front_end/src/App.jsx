// src/App.jsx - ATUALIZADO
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';

import PaginaInicial from './pages/PaginaInicial.jsx';
import PaginaInicialLog from './pages/PaginaInicialLog.jsx';
import PaginaCatalogo from './pages/PaginaCatalogo.jsx';
import PaginaCriarSneaker from './pages/PaginaCriarSneaker.jsx';
import PaginaPerfil from './pages/PaginaPerfil.jsx';
import PaginaLogin from './pages/PaginaLogin.jsx';
import PaginaCadastro from './pages/PaginaCadastro.jsx';
import PaginaEstoque from './pages/PaginaEstoque.jsx'; // NOVA PÁGINA
import MeusPedidos from "./components/MeusPedidos.jsx";
import RastrearPedido from "./components/RastrearPedido.jsx";

// Componente para gerenciar o background baseado na rota
function BackgroundHandler() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    
    // Páginas que devem ter fundo branco/cinza (apenas páginas deslogadas)
    if (
      path === "/login" || 
      path === "/cadastro" || 
      path === "/"  // Apenas raiz (página inicial deslogada)
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
      <Router>
        <BackgroundHandler />
        <Routes>
          {/* Rota Raiz: Página Inicial DESLOGADA (fundo branco) */}
          <Route path="/" element={<PaginaInicial />} /> 
          
          {/* Rotas de Autenticação (fundo branco) */}
          <Route path="/login" element={<PaginaLogin />} />
          <Route path="/cadastro" element={<PaginaCadastro />} />

          {/* Rotas Logadas (background da imagem) */}
          <Route path="/home" element={<PaginaInicialLog />} />
          <Route path="/catalogo" element={<PaginaCatalogo />} />
          <Route path="/criar-sneaker" element={<PaginaCriarSneaker />} />
          <Route path="/estoque" element={<PaginaEstoque />} /> {/* NOVA ROTA */}
          <Route path="/perfil" element={<PaginaPerfil />} />
          <Route path="/meus-pedidos" element={<MeusPedidos />} />
          <Route path="/rastrear-pedido/:pedidoId" element={<RastrearPedido />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;