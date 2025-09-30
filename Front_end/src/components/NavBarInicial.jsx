// src/components/NavBarInicial.jsx

import React from 'react';
import { Link } from 'react-router-dom';

const NavBarInicial = () => { // Nome do componente é NavBarInicial
    return (
        <>
            <style>
                {`
                /* * CSS EMBUTIDO para NavBarInicial 
                 * Ajustado para ter apenas a logo e os botões de Login/Cadastro
                 */

                .navbar {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    z-index: 10;
                    background-color: white;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    padding: 1rem 2rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between; 
                }

                .navbar-logo-link {
                    text-decoration: none;
                }

                .logo-text-black {
                    color: black;
                    font-size: 1.5rem;
                    font-weight: bold;
                }

                .logo-text-orange {
                    color: #FF9D00;
                    font-size: 1.5rem;
                    font-weight: bold;
                }

                .navbar-left {
                    display: flex;
                    align-items: center;
                    justify-content: flex-start;
                }

                .navbar-right {
                    display: flex;
                    align-items: center;
                    gap: 15px; 
                }

                /* Ocultamos a lista de links que seriam para Perfil, Catálogo, etc. */
                .navbar-links {
                    display: none; 
                }

                .nav-button {
                    background-color: transparent;
                    color: #FF9D00; 
                    border: 1px solid #FF9D00; 
                    padding: 8px 16px;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-decoration: none; 
                }

                .nav-button:hover {
                    background-color: #FF9D00;
                    color: #fff;
                }

                /* Estilo específico para o botão Cadastro (destaque) */
                .nav-button.cadastro-button {
                    background-color: #FF9D00; 
                    color: #fff;
                    border: 1px solid #FF9D00; 
                }
                
                .nav-button.cadastro-button:hover {
                    background-color: #e08b00; 
                }
                
                .nav-button-link {
                    text-decoration: none;
                }

                /* Media Queries para Responsividade */
                @media (max-width: 768px) {
                    .navbar {
                        flex-direction: column;
                        align-items: center;
                        padding: 1rem;
                    }

                    .navbar-logo-link {
                        margin-bottom: 1rem;
                    }

                    .navbar-right {
                        flex-direction: column;
                        width: 100%;
                        gap: 10px; 
                    }
                    
                    .nav-button-link {
                        width: 100%;
                    }
                    .nav-button {
                        width: 100%; 
                    }
                }
                `}
            </style>
            
            <nav className="navbar">
                <div className="navbar-left">
                    {/* O logo aponta para a página de login/landing page */}
                    <Link to="/" className="navbar-logo-link">
                        <span className="logo-text-black">Sneak</span>
                        <span className="logo-text-orange">Lab</span>
                    </Link>
                </div>
                <div className="navbar-right">
                    {/* Botão de Login (aponta para a rota de Login) */}
                    <Link to="/login" className="nav-button-link">
                        <button className="nav-button">
                            Login
                        </button>
                    </Link>
                    
                    {/* Botão de Cadastro (aponta para a rota de Cadastro) */}
                    <Link to="/cadastro" className="nav-button-link">
                        <button className="nav-button cadastro-button">
                            Cadastro
                        </button>
                    </Link>
                </div>
            </nav>
        </>
    );
};

export default NavBarInicial; // Exporta com 'B' maiúsculo