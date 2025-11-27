import React from 'react';
import Navbar from '../components/Navbar';
import Catalogo from '../components/Catalogo';
import Footer from '../components/Footer';

function PaginaCatalogo() {
    return (
        <>
           <style>
                {`
                /* Cores do Projeto */
                :root {
                    --laranja-vibrante: var(--primary-color); /* 🎨 AGORA USA A COR DO TEMA */
                    --preto: #000000;
                    --cinza-medio: #A6A6A6;
                    --branco: #FFFFFF;
                    --cinza-claro: #F5F5F5;
                }
                
                /* **CORREÇÃO: Remove o background que sobrescrevia o global */
                body {
                    margin: 0;
                    padding: 0;
                    min-height: 100vh;
                    width: 100%;
                    /* ⚠️ REMOVIDO: background-color */
                }

                /* Estilos da Página e do Contêiner Principal */
                .catalogo-page-container {
                    padding-top: 5rem; 
                    padding-bottom: 2rem;
                    width: 100%; 
                    min-height: 100vh;
                    /* ⚠️ REMOVIDO: background-color: var(--cinza-claro); */
                    display: flex;
                    justify-content: center; 
                    align-items: flex-start; 
                    box-sizing: border-box;
                }

                .catalogo-main-container {
                    width: 95%;
                    max-width: 1200px;
                    background-color: var(--branco);
                    border-radius: 1.5rem; 
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15); 
                    padding: 2.5rem;
                    margin-top: 1.5rem;
                }
                
                /* Estilos do Conteúdo do Catálogo */
                .catalogo-titulo {
                    font-size: 2.5rem;
                    color: var(--laranja-vibrante); /* 🎨 USA A COR DO TEMA */
                    text-align: center;
                    margin-bottom: 2rem;
                    border-bottom: 3px solid var(--laranja-vibrante); /* 🎨 USA A COR DO TEMA */
                    padding-bottom: 0.5rem;
                }

                .catalogo-secao {
                    margin-bottom: 3rem;
                    padding-bottom: 1.5rem;
                    border-bottom: 1px solid var(--cinza-claro);
                }

                .secao-titulo {
                    font-size: 1.75rem;
                    color: var(--preto);
                    font-weight: bold;
                    margin-bottom: 1.5rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    padding-left: 1rem;
                    border-left: 5px solid var(--laranja-vibrante); /* 🎨 USA A COR DO TEMA */
                }

                .catalogo-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); 
                    gap: 1.5rem;
                    justify-content: center;
                    align-items: stretch;
                }
                
                .catalogo-card {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 1rem;
                    border-radius: 0.75rem;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); 
                    transition: transform 0.2s, box-shadow 0.2s;
                    cursor: pointer;
                    height: 100%; 
                }

                .catalogo-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
                }

                .card-img-placeholder {
                    /* AUMENTADO O TAMANHO AQUI */
                    width: 150px; 
                    height: 150px;
                    border-radius: 0.5rem;
                    /* background-color removido na correção anterior */
                    margin-bottom: 0.75rem;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                
                /* Garante que a imagem preencha o novo tamanho */
                .card-img-placeholder img {
                    max-width: 100%;
                    max-height: 100%;
                    /* 🚀 CORREÇÃO: Usa 'cover' para ampliar e preencher todo o contêiner */
                    object-fit: cover;
                    border-radius: 0.5rem;
                }

                .card-img-placeholder i {
                    /* AUMENTADO O TAMANHO DO ÍCONE AQUI */
                    font-size: 4rem; 
                    color: var(--cinza-medio); 
                }
                
                .card-legenda {
                    font-weight: 600;
                    color: var(--preto);
                    margin: 0;
                    text-align: center;
                }

                .catalogo-footer-text {
                    text-align: center;
                    margin-top: 3rem;
                    padding-top: 1rem;
                    border-top: 1px dashed var(--cinza-medio);
                    color: var(--cinza-medio);
                }
                
                /* Ajuste de responsividade para telas menores */
                @media (max-width: 768px) {
                    .catalogo-main-container {
                        padding: 1.5rem;
                    }
                    .catalogo-titulo {
                        font-size: 2rem;
                    }
                    .secao-titulo {
                        font-size: 1.5rem;
                    }
                    .catalogo-grid {
                        grid-template-columns: 1fr 1fr; 
                    }
                    .card-img-placeholder {
                        /* AJUSTE PARA RESPONSIVIDADE */
                        width: 120px;
                        height: 120px;
                    }
                }

                @media (max-width: 480px) {
                    .catalogo-grid {
                        grid-template-columns: 1fr; 
                    }
                }
                `}
            </style>
            
            <Navbar />

            <div className="catalogo-page-container">
                <div className="catalogo-main-container">
                    <Catalogo />
                </div>
            </div>
            
            <Footer/>
        </>
    );
}

export default PaginaCatalogo;