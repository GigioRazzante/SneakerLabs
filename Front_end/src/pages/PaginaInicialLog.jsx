import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const PaginaInicialLog = () => {
    return (
        <>
            <style>
                {`
                /* VARIÁVEIS GLOBAIS PARA CONSISTÊNCIA */
                :root {
                    --laranja-vibrante: #FF9D00;
                    --preto: #000000;
                    --cinza-escuro: #333;
                    --cinza-claro: #f0f2f5;
                    --branco: #FFFFFF;
                    --navbar-height: 6rem; /* Altura padrão para desktop */
                }
                
                /* CORREÇÕES GLOBAIS DE LAYOUT E ROLAGEM */
                html { overflow-x: hidden; }
                body, html, #root {
                    margin: 0;
                    padding: 0;
                    width: 100%;
                    min-height: 100vh; /* Use min-height em vez de height para permitir que o conteúdo cresça */
                    overflow-x: hidden;
                    background-color: var(--cinza-claro); 
                }

                /* Container Principal (Afastamento da Navbar) */
                .main-container-logged {
                    position: relative;
                    width: 100%;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-start;
                    /* PADDING AJUSTADO PARA NAVBAR FIXA */
                    padding-top: var(--navbar-height); 
                    padding-bottom: 3rem; /* Espaço no final da página */
                }

                .content-logged {
                    position: relative;
                    z-index: 1;
                    width: 100%;
                    /* Removido min-height: 100vh para permitir rolagem natural do conteúdo */
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-start; /* Alinha o conteúdo ao topo, não ao centro verticalmente */
                    text-align: center;
                    padding: 0 1rem;
                    box-sizing: border-box;
                }

                /* Títulos */
                .title-section-logged {
                    margin: 2rem 0;
                    max-width: 900px;
                }

                .title-logged {
                    font-size: 2.8rem; /* Ligeiramente maior para impacto */
                    font-weight: bold;
                    color: var(--cinza-escuro);
                    margin-bottom: 0.5rem;
                }

                .subtitle-logged {
                    font-size: 1.6rem;
                    color: #555;
                }

                /* Cards */
                .card-container-logged {
                    display: flex;
                    justify-content: center;
                    gap: 2rem;
                    flex-wrap: wrap;
                    max-width: 1100px; /* Aumenta o espaço para desktops */
                    width: 95%;
                    margin: 0 auto;
                }

                .card-logged {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    /* Tamanho fixo para desktop, que será ajustado em mobile */
                    width: 250px; 
                    height: 350px; 
                    background-color: var(--branco);
                    border-radius: 1.5rem; /* Borda mais suave */
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
                    font-size: 5rem; /* Ícones maiores */
                    margin-bottom: 1.5rem;
                    color: var(--laranja-vibrante);
                }

                .card-text {
                    font-size: 1.4rem;
                    font-weight: 700;
                    color: var(--preto);
                }
                
                /* RESPONSIVIDADE (Tablets e Mobile) */
                @media (max-width: 1024px) {
                     .title-logged {
                        font-size: 2.2rem;
                    }

                    .subtitle-logged {
                        font-size: 1.4rem;
                    }
                }

                @media (max-width: 768px) {
                    :root {
                        --navbar-height: 4.5rem; /* Navbar menor em mobile */
                    }
                    .main-container-logged {
                        padding-top: var(--navbar-height); 
                        padding-bottom: 2rem;
                    }
                    .title-section-logged {
                        margin: 1.5rem 0;
                    }
                    .card-container-logged {
                        /* Permite que os cards fiquem um embaixo do outro, mas centralizados */
                        flex-direction: column;
                        align-items: center;
                        gap: 1.5rem;
                    }
                    .card-logged {
                        /* Ocupa a largura total do container (95%) em mobile, com largura máxima */
                        width: 95%;
                        max-width: 400px;
                        height: 180px; /* Mais curtos para caberem na tela */
                        flex-direction: row; /* Conteúdo alinhado lado a lado */
                        justify-content: space-around;
                        padding: 0 1rem;
                    }
                    .card-content {
                        flex-direction: row;
                        gap: 1.5rem;
                        padding: 0;
                        height: auto;
                    }
                    .icon-sneaker,
                    .icon-catalog,
                    .icon-profile {
                        font-size: 3rem; /* Ícones menores em mobile */
                        margin-bottom: 0;
                    }
                    .card-text {
                        font-size: 1.1rem;
                        text-align: left;
                        flex-grow: 1; /* Ocupa o espaço restante */
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
                        <Link to="/criar-sneaker" className="card-logged">
                            <div className="card-content">
                                <span className="icon-sneaker">
                                    <i className="fa-solid fa-paintbrush fa-2xl"></i>
                                </span>
                                <p className="card-text">Criar meu Sneaker</p>
                            </div>
                        </Link>
                        <Link to="/catalogo" className="card-logged">
                            <div className="card-content">
                                <span className="icon-catalog">
                                    <i className="fa-solid fa-bag-shopping fa-2xl"></i>
                                </span>
                                <p className="card-text">Catálogo</p>
                            </div>
                        </Link>
                        <Link to="/perfil" className="card-logged">
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
        </>
    );
};

export default PaginaInicialLog;