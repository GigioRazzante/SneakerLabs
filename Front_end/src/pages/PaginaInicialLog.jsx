import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const PaginaInicialLog = () => {
    return (
        <>
            <style>
                {`
                body, html, #root {
                    margin: 0;
                    padding: 0;
                    width: 100%;
                    height: 100%;
                }

                .main-container-logged {
                    position: relative;
                    width: 100%;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-start;
                    padding-top: 6rem;
                    background-color: #f0f2f5; 
                }

                .content-logged {
                    position: relative;
                    z-index: 1;
                    width: 100%;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                }

                .title-section-logged {
                    margin-bottom: 2rem;
                }

                .title-logged {
                    font-size: 2.5rem;
                    font-weight: bold;
                    color: #333;
                    margin-bottom: 0.5rem;
                }

                .subtitle-logged {
                    font-size: 1.5rem;
                    color: #555;
                }

                .card-container-logged {
                    display: flex;
                    justify-content: center;
                    gap: 2rem;
                    flex-wrap: wrap;
                    max-width: 90%;
                    margin: 0 auto;
                }

                .card-logged {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    width: 250px;
                    height: 350px;
                    background-color: white;
                    border-radius: 1rem;
                    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
                    transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
                    text-decoration: none;
                    color: inherit;
                    border: 3px solid #ff9d00;
                }

                .card-logged:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 15px 20px rgba(0, 0, 0, 0.2);
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
                    font-size: 4rem;
                    margin-bottom: 1rem;
                    color: #ff9d00;
                }

                .card-text {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #333;
                }
                
                /* Responsividade */
                @media (max-width: 768px) {
                    .card-container-logged {
                        flex-direction: column;
                        align-items: center;
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