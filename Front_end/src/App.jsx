// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importe todos os seus componentes de página
import PaginaInicialLog from './pages/PaginaInicialLog.jsx';
import PaginaCatalogo from './pages/PaginaCatalogo.jsx';
import PaginaCriarSneaker from './pages/PaginaCriarSneaker.jsx';
import PaginaPerfil from './pages/PaginaPerfil.jsx';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="content-container"> {/* Container para o conteúdo principal */}
        <Routes>
          <Route path="/" element={<PaginaInicialLog />} />
          <Route path="/catalogo" element={<PaginaCatalogo />} />
          <Route path="/criar-sneaker" element={<PaginaCriarSneaker />} />
          <Route path="/perfil" element={<PaginaPerfil />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;