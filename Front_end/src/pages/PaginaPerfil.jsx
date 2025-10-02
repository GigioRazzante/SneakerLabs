import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AlterarDadosUsuario from '../components/AlterarDadosUsuario';

function PaginaPerfil() {
  return (
    <>
      <style>
        {`
          .profile-page-container {
            min-height: 100vh;
            padding-top: 5rem;
            padding-bottom: 2rem;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            width: 100%;
          }
        `}
      </style>
      
      <Navbar />
      
      <div className="profile-page-container">
        <AlterarDadosUsuario />
      </div>

      <Footer />
    </>
  );
}

export default PaginaPerfil;