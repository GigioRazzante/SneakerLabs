// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';

// Importe todos os seus componentes de página
import PaginaInicial from './pages/PaginaInicial.jsx'; // A página inicial que você tinha
import PaginaInicialLog from './pages/PaginaInicialLog.jsx';
import PaginaCatalogo from './pages/PaginaCatalogo.jsx';
import PaginaCriarSneaker from './pages/PaginaCriarSneaker.jsx';
import PaginaPerfil from './pages/PaginaPerfil.jsx';
import PaginaLogin from './pages/PaginaLogin.jsx';
import PaginaCadastro from './pages/PaginaCadastro.jsx';
import Navbar from './components/Navbar';

// Um novo componente para agrupar as rotas com Navbar
const AppLayout = () => (
  <>
    <Navbar />
    <div className="content-container">
      <Outlet />
    </div>
  </>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Rotas que não precisam da Navbar */}
        <Route path="/" element={<PaginaLogin />} />
        <Route path="/cadastro" element={<PaginaCadastro />} />

        {/* Agrupa as rotas que precisam da Navbar */}
        <Route element={<AppLayout />}>
          <Route path="/home" element={<PaginaInicialLog />} />
          <Route path="/catalogo" element={<PaginaCatalogo />} />
          <Route path="/criar-sneaker" element={<PaginaCriarSneaker />} />
          <Route path="/perfil" element={<PaginaPerfil />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;