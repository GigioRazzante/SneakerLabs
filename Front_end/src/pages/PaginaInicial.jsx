import React from 'react'; 
import { Link } from 'react-router-dom';
import NavbarInicial from '../components/NavBarInicial';
import Footer from '../components/Footer';

import logoCriarSneaker from '../assets/logoCriarSneaker.png'; 
import logoCatalogo from '../assets/logoCatalogo.png';
import logoPerfil from '../assets/logoPerfil.png';
import sneakerlabBg from '../assets/sneakerlabBg.png'; // 🔥 BG igual ao da versão logada

const PaginaInicial = () => {
  return (
    <>
      <style>
        {`
        :root {
          --laranja-vibrante: #FF9D00;
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

        .main-container {
          position: relative;
          width: 100%;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding-top: var(--navbar-height); 
          padding-bottom: 3rem;
          background-image: url(${sneakerlabBg});
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        .content {
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

        .title-section {
          background-color: rgba(255, 255, 255, 0.7);
          padding: 1rem 2rem;
          border-radius: 10px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          margin: 2rem 0;
          max-width: 900px;
        }

        .title {
          font-size: 2.8rem;
          font-weight: bold;
          color: var(--cinza-escuro);
          margin-bottom: 0.5rem;
        }

        .subtitle {
          font-size: 1.6rem;
          color: #555;
        }

        .card-container {
          display: flex;
          justify-content: center;
          gap: 2rem;
          flex-wrap: wrap;
          max-width: 1100px;
          width: 95%;
          margin: 0 auto;
        }

        .card {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: center;
          width: 250px;
          height: 350px;
          background-color: var(--branco);
          border-radius: 1.5rem;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease-in-out;
          text-decoration: none;
          color: inherit;
          border: 3px solid var(--laranja-vibrante);
          overflow: hidden;
        }

        .card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 18px 25px rgba(0, 0, 0, 0.2);
        }

        .card.bg-sneaker {
          background-image: url(${logoCriarSneaker});
          background-size: cover;
          background-position: center;
        }
        .card.bg-catalogo {
          background-image: url(${logoCatalogo});
          background-size: cover;
          background-position: center;
        }
        .card.bg-perfil {
          background-image: url(${logoPerfil});
          background-size: cover;
          background-position: center;
        }

        /* 🔼 Texto no topo do card */
        .card-text {
          position: absolute;
          top: 0.8rem;
          left: 50%;
          transform: translateX(-50%);
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--laranja-vibrante);
          background-color: rgba(255, 255, 255, 0.85);
          padding: 0.4rem 1rem;
          border-radius: 0.8rem;
          z-index: 3;
          white-space: nowrap; /* 🚫 impede quebra de linha */
        }

        .card-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          width: 100%;
          height: 100%;
          padding-bottom: 2rem;
        }

        .icon-sneaker,
        .icon-catalog,
        .icon-profile {
          font-size: 5rem;
          margin-bottom: 1.5rem;
          color: var(--laranja-vibrante);
        }

        .card.bg-sneaker .icon-sneaker,
        .card.bg-catalogo .icon-catalog,
        .card.bg-perfil .icon-profile {
          display: none;
        }

        @media (max-width: 1024px) {
          .title { font-size: 2.2rem; }
          .subtitle { font-size: 1.4rem; }
        }

        @media (max-width: 768px) {
          :root { --navbar-height: 4.5rem; }
          .main-container {
            padding-top: var(--navbar-height);
            padding-bottom: 2rem;
          }
          .card-container {
            flex-direction: column;
            align-items: center;
            gap: 1.5rem;
          }
          .card {
            width: 95%;
            max-width: 400px;
            height: 180px;
          }
          .card-text {
            top: 0.6rem;
            font-size: 1.2rem;
            white-space: nowrap;
          }
        }
        `}
      </style>

      <NavbarInicial />

      <div className="main-container">
        <div className="content">
          <div className="title-section">
            <h1 className="title">Bem-vindo ao SneakLab,</h1>
            <p className="subtitle">Personalize já seu Sneaker</p>
          </div>

          <div className="card-container">
            <Link to="/login" className="card bg-sneaker">
              <p className="card-text">Criar meu Sneaker</p>
              <div className="card-content">
                <span className="icon-sneaker">
                  <i className="fa-solid fa-paintbrush fa-2xl"></i>
                </span>
              </div>
            </Link>

            <Link to="/login" className="card bg-catalogo">
              <p className="card-text">Catálogo</p>
              <div className="card-content">
                <span className="icon-catalog">
                  <i className="fa-solid fa-bag-shopping fa-2xl"></i>
                </span>
              </div>
            </Link>

            <Link to="/login" className="card bg-perfil">
              <p className="card-text">Meu Perfil</p>
              <div className="card-content">
                <span className="icon-profile">
                  <i className="fa-solid fa-user fa-2xl"></i>
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default PaginaInicial;
