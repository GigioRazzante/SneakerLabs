// src/pages/PaginaInicial.jsx (Página para usuário DESLOGADO)
import React from 'react';
import { Link } from 'react-router-dom';
import NavbarInicial from '../components/NavBarInicial';
import Footer from '../components/Footer';

const PaginaInicial = () => {
    return (
        <>
            <style>
                {`
                /* VARIÁVEIS GLOBAIS */
                :root {
                    --laranja-vibrante: #FF9D00;
                    --preto: #000000;
                    --cinza-escuro: #333;
                    --cinza-claro: #f5f5f5; /* CORRIGIDO: usando a mesma cor do no-bg */
                    --branco: #FFFFFF;
                    --navbar-height: 6rem;
                }
                
                /* IMPORTANTE: NÃO definir background no body aqui */
                /* O BackgroundHandler já cuida disso */
                
                .main-container-logged {
                    width: 100%;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-start;
                    padding-top: var(--navbar-height); 
                    padding-bottom: 3rem; 
                }

                .content-logged {
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
                    border: 3px solid var(--laranja-vibrante);
                    box-sizing: border-box; 
                }

                .card-logged:hover {
                    transform: translateY(-8px) scale(1.02);
                    box-shadow: 0 18px 25px rgba(0, 0, 0, 0.2);
                }

                .card-content {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                    height: 100%;
                    padding: 1.5rem;
                }

                .icon-sneaker,
                .icon-catalog,
                .icon-profile {
                    font-size: 5rem; 
                    margin-bottom: 1.5rem;
                    color: var(--laranja-vibrante);
                }

                .card-text {
                    font-size: 1.4rem;
                    font-weight: 700;
                    color: var(--preto);
                }
                
                /* RESPONSIVIDADE */
                @media (max-width: 1024px) {
                    .title-logged { font-size: 2.2rem; }
                    .subtitle-logged { font-size: 1.4rem; }
                }

                @media (max-width: 768px) {
                    :root { --navbar-height: 4.5rem; }
                    .main-container-logged { padding-top: var(--navbar-height); padding-bottom: 2rem; }
                    .title-section-logged { margin: 1.5rem 0; }
                    .card-container-logged { flex-direction: column; align-items: center; gap: 1.5rem; }
                    .card-logged { 
                        width: 95%; max-width: 400px; height: 180px; 
                        flex-direction: row; justify-content: space-around; padding: 0 1rem; 
                    }
                    .card-content { flex-direction: row; gap: 1.5rem; padding: 0; height: auto; }
                    .icon-sneaker, .icon-catalog, .icon-profile { font-size: 3rem; margin-bottom: 0; }
                    .card-text { font-size: 1.1rem; text-align: left; flex-grow: 1; }
                }
                `}
            </style>
            
            <NavbarInicial />
            <div className="main-container-logged">
                <div className="content-logged">
                    <div className="title-section-logged">
                        <h1 className="title-logged">Bem-vindo ao SneakLab,</h1>
                        <p className="subtitle-logged">Personalize já seu Sneaker</p>
                    </div>
                    <div className="card-container-logged">
                        <Link to="/" className="card-logged" onClick={() => alert("Por favor, faça login para criar seu Sneaker.")}>
                            <div className="card-content">
                                <span className="icon-sneaker">
                                    <i className="fa-solid fa-paintbrush fa-2xl"></i>
                                </span>
                                <p className="card-text">Criar meu Sneaker</p>
                            </div>
                        </Link>
                        <Link to="/" className="card-logged" onClick={() => alert("Por favor, faça login para ver o Catálogo completo.")}>
                            <div className="card-content">
                                <span className="icon-catalog">
                                    <i className="fa-solid fa-bag-shopping fa-2xl"></i>
                                </span>
                                <p className="card-text">Catálogo</p>
                            </div>
                        </Link>
                        <Link to="/" className="card-logged" onClick={() => alert("Por favor, faça login para acessar seu Perfil.")}>
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

export default PaginaInicial;