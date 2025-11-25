import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx'; // 🎨 NOVO IMPORT
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

import logoCriarSneaker from '../assets/logoCriarSneaker.png'; 
import logoCatalogo from '../assets/logoCatalogo.png';
import logoPerfil from '../assets/logoPerfil.png';

const PaginaInicialLog = () => {
  const { primaryColor } = useTheme(); // 🎨 HOOK DO TEMA

  return (
    <>
      <style>
        {`
        :root {
          --laranja-vibrante: var(--primary-color); /* 🎨 COR DO TEMA */
          --preto: #000000;
          --cinza-escuro: #333;
          --cinza-claro: #f0f2f5;
          --branco: #FFFFFF;
          --navbar-height: 6rem;
        }

        html { overflow-x: hidden; }
        body, html, #root {
          margin: 0;
          padding: 0;
          width: 100%;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .main-container-logged {
          position: relative;
          width: 100%;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding-top: var(--navbar-height); 
          padding-bottom: 3rem;
          background-color: transparent;
        }

        .content-logged {
          position: relative;
          z-index: 1;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          text-align: center;
          padding: 0 1rem;
          box-sizing: border-box;
        }

        .title-section-logged {
          background-color: rgba(255, 255, 255, 0.7);
          padding: 1rem 2rem;
          border-radius: 10px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          margin: 2rem 0;
          max-width: 900px;
        }

        .title-logged {
          font-size: 2.8rem;
          font-weight: bold;
          color: var(--cinza-escuro);
          margin-bottom: 0.5rem;
        }

        .subtitle-logged {
          font-size: 1.6rem;
          color: #555;
        }

        .card-container-logged {
          display: flex;
          justify-content: center;
          gap: 2rem;
          flex-wrap: wrap;
          max-width: 1100px;
          width: 95%;
          margin: 0 auto;
        }

        .card-logged {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 250px;
          height: 350px;
          background-color: var(--branco);
          border-radius: 1.5rem;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease-in-out;
          text-decoration: none;
          color: inherit;
          border: 3px solid var(--laranja-vibrante); /* 🎨 COR DO TEMA */
          box-sizing: border-box;
          position: relative;
          overflow: hidden;
        }

        .card-logged:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 18px 25px rgba(0, 0, 0, 0.2);
        }

        /* 🔥 FUNDO DOS CARDS (mantido igual) */
        .card-logged.bg-sneaker {
          background-image: url(${logoCriarSneaker});
          background-size: cover;
          background-position: center;
        }
        .card-logged.bg-catalogo {
          background-image: url(${logoCatalogo});
          background-size: cover;
          background-position: center;
        }
        .card-logged.bg-perfil {
          background-image: url(${logoPerfil});
          background-size: cover;
          background-position: center;
        }

        /* 🚫 REMOVIDO o overlay esbranquiçado */
        /* .card-logged::before e hover foram eliminados */

        .card-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          width: 100%;
          height: 100%;
          padding-top: 2rem;
        }

        .icon-sneaker,
        .icon-catalog,
        .icon-profile {
          font-size: 5rem;
          margin-bottom: 1.5rem;
          color: var(--laranja-vibrante); /* 🎨 COR DO TEMA */
        }

        .card-text {
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--laranja-vibrante); /* 🎨 COR DO TEMA */
        }

        .card-logged.bg-sneaker .icon-sneaker,
        .card-logged.bg-catalogo .icon-catalog,
        .card-logged.bg-perfil .icon-profile {
          display: none;
        }

        @media (max-width: 1024px) {
          .title-logged { font-size: 2.2rem; }
          .subtitle-logged { font-size: 1.4rem; }
        }

        @media (max-width: 768px) {
          :root { --navbar-height: 4.5rem; }
          .main-container-logged {
            padding-top: var(--navbar-height);
            padding-bottom: 2rem;
          }
          .card-container-logged {
            flex-direction: column;
            align-items: center;
            gap: 1.5rem;
          }
          .card-logged {
            width: 95%;
            max-width: 400px;
            height: 180px;
            flex-direction: row;
            justify-content: space-around;
            padding: 0 1rem;
          }
          .card-content {
            flex-direction: column;
            justify-content: center;
            padding-top: 0;
          }
          .card-text {
            font-size: 1.2rem;
          }
        }
        `}
      </style>

      <Navbar />

      <div className="main-container-logged">
        <div className="content-logged">
          <div className="title-section-logged">
            <h1 className="title-logged">Bem-vindo ao SneakLab,</h1>
            <p className="subtitle-logged">Personalize já seu Sneaker</p>
          </div>

          <div className="card-container-logged">
            <Link to="/criar-sneaker" className="card-logged bg-sneaker">
              <div className="card-content">
                <span className="icon-sneaker">
                  <i className="fa-solid fa-paintbrush fa-2xl"></i>
                </span>
                <p className="card-text">Criar meu Sneaker</p>
              </div>
            </Link>

            <Link to="/catalogo" className="card-logged bg-catalogo">
              <div className="card-content">
                <span className="icon-catalog">
                  <i className="fa-solid fa-bag-shopping fa-2xl"></i>
                </span>
                <p className="card-text">Catálogo</p>
              </div>
            </Link>

            <Link to="/perfil" className="card-logged bg-perfil">
              <div className="card-content">
                <span className="icon-profile">
                  <i className="fa-solid fa-user fa-2xl"></i>
                </span>
                <p className="card-text">Meu Perfil</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default PaginaInicialLog;