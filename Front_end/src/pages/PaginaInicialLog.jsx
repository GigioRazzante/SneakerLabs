import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

import logoCriarSneaker from '../assets/logoCriarSneaker.png'; 
import logoCatalogo from '../assets/logoCatalogo.png';
import logoPerfil from '../assets/logoPerfil.png';

const PaginaInicialLog = () => {
  const { primaryColor } = useTheme();
  const { user } = useAuth();

  return (
    <>
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Sedgwick+Ave+Display&display=swap');
        
        :root {
          --laranja-vibrante: var(--primary-color);
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

        /* 🎨 SEÇÃO DE TÍTULO MELHORADA */
        .title-section-logged {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%);
          padding: 2rem 3rem;
          border-radius: 20px;
          box-shadow: 
            0 8px 25px rgba(0, 0, 0, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          margin: 3rem 0;
          max-width: 900px;
          width: 90%;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          position: relative;
          overflow: hidden;
        }

        .title-section-logged::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, transparent 0%, ${primaryColor} 50%, transparent 100%);
        }

        .title-logged {
          font-size: 3.5rem;
          font-weight: 800;
          color: var(--cinza-escuro);
          margin-bottom: 0.5rem;
          line-height: 1.1;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
        }

        .sneaklab-highlight {
          color: ${primaryColor};
          position: relative;
          display: inline-block;
        }

        .sneaklab-highlight::after {
          content: '';
          position: absolute;
          bottom: 5px;
          left: 0;
          width: 100%;
          height: 8px;
          background-color: ${primaryColor}33;
          border-radius: 4px;
          z-index: -1;
        }

        .subtitle-logged {
          font-size: 2rem;
          color: ${primaryColor};
          font-family: 'Sedgwick Ave Display', cursive;
          margin-top: 1rem;
          line-height: 1.2;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
          letter-spacing: 1px;
        }

        .user-greeting {
          font-size: 1.1rem;
          color: #666;
          margin-bottom: 1.5rem;
          font-style: italic;
        }

        .card-container-logged {
          display: flex;
          justify-content: center;
          gap: 2.5rem;
          flex-wrap: wrap;
          max-width: 1200px;
          width: 95%;
          margin: 0 auto;
        }

        .card-logged {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 280px;
          height: 380px;
          background-color: var(--branco);
          border-radius: 2rem;
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          text-decoration: none;
          color: inherit;
          border: 3px solid ${primaryColor};
          box-sizing: border-box;
          position: relative;
          overflow: hidden;
        }

        .card-logged:hover {
          transform: translateY(-12px) scale(1.03);
          box-shadow: 0 25px 40px rgba(0, 0, 0, 0.2);
        }

        .card-logged::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: ${primaryColor};
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .card-logged:hover::before {
          transform: scaleX(1);
        }

        /* 🔥 FUNDO DOS CARDS - IMAGENS MENORES E MAIS PARA BAIXO */
        .card-logged.bg-sneaker {
          background-image: url(${logoCriarSneaker});
          background-size: 70%; /* 🔽 IMAGEM MENOR */
          background-position: center 65%; /* 🔽 MAIS PARA BAIXO */
          background-repeat: no-repeat;
        }
        .card-logged.bg-catalogo {
          background-image: url(${logoCatalogo});
          background-size: 70%; /* 🔽 IMAGEM MENOR */
          background-position: center 65%; /* 🔽 MAIS PARA BAIXO */
          background-repeat: no-repeat;
        }
        .card-logged.bg-perfil {
          background-image: url(${logoPerfil});
          background-size: 70%; /* 🔽 IMAGEM MENOR */
          background-position: center 65%; /* 🔽 MAIS PARA BAIXO */
          background-repeat: no-repeat;
        }

        /* 🎯 CONTEÚDO DOS CARDS - ESCRITAS MAIS PARA CIMA */
        .card-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          width: 100%;
          height: 100%;
          padding-top: 1.5rem; /* 🔼 ESCRITA MAIS PARA CIMA */
        }

        .icon-sneaker,
        .icon-catalog,
        .icon-profile {
          font-size: 5.5rem;
          margin-bottom: 1.5rem; /* 🔼 MENOS ESPAÇO ABAIXO DO ÍCONE */
          color: ${primaryColor};
          transition: transform 0.3s ease;
        }

        .card-logged:hover .icon-sneaker,
        .card-logged:hover .icon-catalog,
        .card-logged:hover .icon-profile {
          transform: scale(1.1);
        }

        .card-text {
          font-size: 1.5rem;
          font-weight: 700;
          color: ${primaryColor};
          background: rgba(255, 255, 255, 0.9);
          padding: 0.8rem 1.5rem;
          border-radius: 15px;
          backdrop-filter: blur(5px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          margin-top: 0.5rem; /* 🔼 ESCRITA MAIS PARA CIMA */
        }

        .card-logged.bg-sneaker .icon-sneaker,
        .card-logged.bg-catalogo .icon-catalog,
        .card-logged.bg-perfil .icon-profile {
          display: none;
        }

        /* 📱 RESPONSIVIDADE MELHORADA */
        @media (max-width: 1200px) {
          .title-logged { font-size: 3rem; }
          .subtitle-logged { font-size: 1.8rem; }
          .card-container-logged { gap: 2rem; }
          .card-logged { width: 260px; height: 360px; }
          
          /* Ajustes responsivos para as imagens */
          .card-logged.bg-sneaker,
          .card-logged.bg-catalogo,
          .card-logged.bg-perfil {
            background-size: 65%;
            background-position: center 60%;
          }
        }

        @media (max-width: 1024px) {
          .title-logged { font-size: 2.8rem; }
          .subtitle-logged { font-size: 1.6rem; }
          .title-section-logged {
            padding: 1.8rem 2.5rem;
            margin: 2.5rem 0;
          }
        }

        @media (max-width: 900px) {
          .card-container-logged {
            gap: 1.8rem;
          }
          .card-logged {
            width: 240px;
            height: 340px;
          }
          
          .card-logged.bg-sneaker,
          .card-logged.bg-catalogo,
          .card-logged.bg-perfil {
            background-size: 60%;
            background-position: center 60%;
          }
        }

        @media (max-width: 768px) {
          :root { --navbar-height: 4.5rem; }
          
          .main-container-logged {
            padding-top: var(--navbar-height);
            padding-bottom: 2rem;
          }
          
          .title-section-logged {
            padding: 1.5rem 2rem;
            margin: 2rem 0;
            width: 95%;
          }
          
          .title-logged {
            font-size: 2.3rem;
          }
          
          .subtitle-logged {
            font-size: 1.4rem;
          }
          
          .user-greeting {
            font-size: 1rem;
          }
          
          .card-container-logged {
            flex-direction: column;
            align-items: center;
            gap: 1.5rem;
            width: 100%;
          }
          
          .card-logged {
            width: 90%;
            max-width: 400px;
            height: 200px;
            flex-direction: row;
            justify-content: space-around;
            padding: 0 1.5rem;
            border-radius: 1.5rem;
          }
          
          /* 📱 AJUSTES MOBILE PARA IMAGENS */
          .card-logged.bg-sneaker,
          .card-logged.bg-catalogo,
          .card-logged.bg-perfil {
            background-size: 40%;
            background-position: center 55%;
          }
          
          .card-content {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            padding-top: 0;
            width: 100%;
          }
          
          .icon-sneaker,
          .icon-catalog,
          .icon-profile {
            font-size: 4rem;
            margin-bottom: 0;
            margin-right: 1rem;
          }
          
          .card-text {
            font-size: 1.3rem;
            padding: 0.6rem 1.2rem;
            margin-top: 0;
          }
        }

        @media (max-width: 480px) {
          .title-section-logged {
            padding: 1.2rem 1.5rem;
          }
          
          .title-logged {
            font-size: 2rem;
          }
          
          .subtitle-logged {
            font-size: 1.2rem;
          }
          
          .card-logged {
            height: 180px;
          }
          
          .card-logged.bg-sneaker,
          .card-logged.bg-catalogo,
          .card-logged.bg-perfil {
            background-size: 35%;
            background-position: center 50%;
          }
          
          .icon-sneaker,
          .icon-catalog,
          .icon-profile {
            font-size: 3.5rem;
          }
          
          .card-text {
            font-size: 1.1rem;
            padding: 0.5rem 1rem;
          }
        }

        @media (max-width: 360px) {
          .title-logged {
            font-size: 1.8rem;
          }
          
          .subtitle-logged {
            font-size: 1.1rem;
          }
          
          .card-content {
            flex-direction: column;
            justify-content: center;
          }
          
          .icon-sneaker,
          .icon-catalog,
          .icon-profile {
            margin-right: 0;
            margin-bottom: 0.5rem;
          }
          
          .card-logged.bg-sneaker,
          .card-logged.bg-catalogo,
          .card-logged.bg-perfil {
            background-size: 30%;
            background-position: center 45%;
          }
        }
        `}
      </style>

      <Navbar />

      <div className="main-container-logged">
        <div className="content-logged">
          <div className="title-section-logged">
            <h1 className="title-logged">
              Bem-vindo ao Sneak<span className="sneaklab-highlight">Lab</span>,
            </h1>
            {user?.nome && (
              <p className="user-greeting">Olá, {user.nome.split(' ')[0]}! 👋</p>
            )}
            <p className="subtitle-logged">Personalize já seu Sneaker!</p>
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