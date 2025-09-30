// src/pages/PaginaCatalogo.jsx (ou onde quer que suas páginas estejam)
import React from 'react';
import Navbar from '../components/Navbar'; // Assumindo que o Navbar está em '../components/Navbar'
import Catalogo from '../components/Catalogo'; // Importa o componente Catalogo

function PaginaCatalogo() {
    return (
        <>
           <style>
                {`
                /* Cores do Projeto */
                :root {
                    --laranja-vibrante: #FF9D00;
                    --preto: #000000;
                    --cinza-medio: #A6A6A6;
                    --branco: #FFFFFF;
                    --cinza-claro: #F5F5F5;
                }
                
                /* **CORREÇÃO: Garante que o body use todo o espaço e permita rolagem vertical.** */
                body {
                    margin: 0;
                    padding: 0;
                    min-height: 100vh;
                    width: 100%;
                }


                /* Estilos da Página e do Contêiner Principal */
                .catalogo-page-container {
                    /* Usar padding-top para compensar o Navbar fixo, se for o caso */
                    padding-top: 5rem; 
                    padding-bottom: 2rem;
                    /* Ocupa a largura total da tela */
                    width: 100%; 
                    min-height: 100vh;
                    background-color: var(--cinza-claro); 
                    display: flex;
                    /* Centraliza o container principal horizontalmente */
                    justify-content: center; 
                    /* Alinha ao topo para começar logo após o Navbar */
                    align-items: flex-start; 
                    box-sizing: border-box;
                }

                .catalogo-main-container {
                    width: 95%; /* Use uma porcentagem maior ou 'auto' */
                    max-width: 1200px;
                    background-color: var(--branco);
                    border-radius: 1.5rem; 
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15); 
                    padding: 2.5rem;
                    margin-top: 1.5rem; /* Margem do topo para afastar do Navbar */
                }
                
                /* Estilos do Conteúdo do Catálogo (mantidos de antes) */
                .catalogo-titulo {
                    font-size: 2.5rem;
                    color: var(--laranja-vibrante);
                    text-align: center;
                    margin-bottom: 2rem;
                    border-bottom: 3px solid var(--laranja-vibrante);
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
                    border-left: 5px solid var(--laranja-vibrante); 
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
                    width: 100px;
                    height: 100px;
                    border-radius: 0.5rem;
                    background-color: var(--cinza-claro);
                    margin-bottom: 0.75rem;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                .card-img-placeholder i {
                    font-size: 3rem;
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
                        width: 80px;
                        height: 80px;
                    }
                }

                @media (max-width: 480px) {
                    .catalogo-grid {
                        grid-template-columns: 1fr; 
                    }
                }
                `}
            </style>
            
           {/* O Navbar precisa ter um z-index alto no CSS para ficar por cima */}
           <Navbar /> 

<div className="catalogo-page-container">
    <div className="catalogo-main-container">
        <Catalogo />
    </div>
</div>
</>
);
}

export default PaginaCatalogo;