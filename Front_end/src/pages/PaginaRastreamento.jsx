// PaginaRastreamento.jsx (nova página)
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RastrearPedido from '../components/RastrearPedido';

function PaginaRastreamento() {
  return (
    <>
      <Navbar />
      
      <div className="page-container">
        <RastrearPedido />
      </div>

      <Footer />
      
      <style>{`
        .page-container {
          min-height: 100vh;
          padding-top: 5rem; /* Espaço para navbar */
          padding-bottom: 2rem;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          width: 100%;
          background-color: #f8f9fa; /* BG padrão */
        }
      `}</style>
    </>
  );
}

export default PaginaRastreamento;