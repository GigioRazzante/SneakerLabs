// src/App.jsx (Atualizado)

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importe todos os seus componentes de página
import PaginaInicial from './pages/PaginaInicial.jsx'; // Nova página inicial deslogada
import PaginaInicialLog from './pages/PaginaInicialLog.jsx';
import PaginaCatalogo from './pages/PaginaCatalogo.jsx';
import PaginaCriarSneaker from './pages/PaginaCriarSneaker.jsx';
import PaginaPerfil from './pages/PaginaPerfil.jsx';
import PaginaLogin from './pages/PaginaLogin.jsx';
import PaginaCadastro from './pages/PaginaCadastro.jsx';
// Navbar não precisa ser importada aqui, pois é importada em cada página.

// Removemos AppLayout pois as páginas (Inicial e Log) já importam sua própria Navbar.

function App() {
  return (
    <Router>
      <Routes>
        {/* Rota Raiz: Página Inicial DESLOGADA (apenas com NavbarInicial) */}
        <Route path="/" element={<PaginaInicial />} /> 
        
        {/* Rotas de Autenticação (Sem Navbar) */}
        <Route path="/login" element={<PaginaLogin />} />
        <Route path="/cadastro" element={<PaginaCadastro />} />

        {/* Rotas Logadas (Com a Navbar completa) */}
        {/* Nota: Essas páginas (PaginaInicialLog, Catalogo, etc.) já possuem a Navbar importada */}
        <Route path="/home" element={<PaginaInicialLog />} />
        <Route path="/catalogo" element={<PaginaCatalogo />} />
        <Route path="/criar-sneaker" element={<PaginaCriarSneaker />} />
        <Route path="/perfil" element={<PaginaPerfil />} />

        {/* Opcional: Redirecionamento de / para /login se a rota / for PaginaInicial */}
        {/* Se o PaginaInicial redirecionar, este é o melhor lugar. */}

      </Routes>
    </Router>
  );
}

export default App;