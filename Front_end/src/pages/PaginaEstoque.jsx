// pages/PaginaEstoque.jsx
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import EstoqueManager from '../components/EstoqueManager';

const PaginaEstoque = () => {
  return (
    <>
      <style>{`
        :root {
          --laranja-vibrante: #FF9D00;
          --preto: #000000;
          --navbar-height: 5rem;
        }
        
        html { overflow-x: hidden; }
        body, html, #root {
          margin: 0;
          padding: 0;
          width: 100%;
          min-height: 100vh;
          overflow-x: hidden;
        }
        
        .page-container {
          padding-top: var(--navbar-height); 
          padding-bottom: 2rem;
          width: 100%; 
          min-height: 100vh;
          display: flex;
          justify-content: center; 
          align-items: flex-start; 
          box-sizing: border-box;
        }

        .main-content-card {
          width: 95%; 
          max-width: 1200px;
          background-color: white;
          border-radius: 1.5rem; 
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15); 
          padding: 2.5rem;
          margin: 1.5rem 0; 
          position: relative;
        }
        
        @media (max-width: 768px) {
          :root {
            --navbar-height: 4.5rem;
          }
          .page-container {
            padding-top: var(--navbar-height);
          }
          .main-content-card {
            padding: 1.5rem;
            margin: 1rem 0;
          }
        }

        @media (max-width: 480px) {
          .main-content-card {
            padding: 1rem;
            margin: 0.5rem 0;
            border-radius: 1rem;
          }
        }
      `}</style>
      
      <Navbar />

      <div className="page-container">
        <div className="main-content-card">
          <div className="card-header-bar"></div>
          <EstoqueManager />
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default PaginaEstoque;