import React, { useState } from 'react';
import Navbar from '../components/Navbar'; // IMPORTADO AQUI
import MenuSelecao from '../components/MenuSelecao';
import ResumoPedido from '../components/ResumoPedido';

const passos = [
    {
        titulo: "Passo 1 de 5: Escolha o seu estilo.",
        opcoes: [
            { id: 1, nome: "Casual", preco: "R$ 200", acrescimo: 200 },
            { id: 2, nome: "Corrida", preco: "R$ 350", acrescimo: 350 },
            { id: 3, nome: "Skate", preco: "R$ 300", acrescimo: 300 }
        ],
    },
    {
        titulo: "Passo 2 de 5: Escolha o material.",
        opcoes: [
            { id: 1, nome: "Couro", preco: "+ R$ 100", acrescimo: 100 },
            { id: 2, nome: "Camurça", preco: "+ R$ 120", acrescimo: 120 },
            { id: 3, nome: "Tecido", preco: "+ R$ 90", acrescimo: 90 }
        ],
    },
    {
        titulo: "Passo 3 de 5: Escolha o solado.",
        opcoes: [
            { id: 1, nome: "Borracha", preco: "+ R$ 40", acrescimo: 40 },
            { id: 2, nome: "EVA", preco: "+ R$ 60", acrescimo: 60 },
            { id: 3, nome: "Air", preco: "+ R$ 90", acrescimo: 90 }
        ],
    },
    {
        titulo: "Passo 4 de 5: Escolha a cor.",
        opcoes: [
            { id: 1, nome: "Branco", preco: "+ R$ 20", acrescimo: 20 },
            { id: 2, nome: "Preto", preco: "+ R$ 30", acrescimo: 30 },
            { id: 3, nome: "Azul", preco: "+ R$ 25", acrescimo: 25 },
            { id: 4, nome: "Vermelho", preco: "+ R$ 28", acrescimo: 28 },
            { id: 5, nome: "Verde", preco: "+ R$ 23", acrescimo: 23 },
            { id: 6, nome: "Amarelo", preco: "+ R$ 30", acrescimo: 30 }
        ],
    },
    {
        titulo: "Passo 5 de 5: Adicione detalhes.",
        opcoes: [
            { id: 1, nome: "Cadarço normal", preco: "+ R$ 20", acrescimo: 20 },
            { id: 2, nome: "Cadarço colorido", preco: "+ R$ 30", acrescimo: 30 },
            { id: 3, nome: "Sem cadarço", preco: "+ R$ 35", acrescimo: 35 }
        ],
    },
];

const PaginaCriarSneaker = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [selections, setSelections] = useState({});

    const handleSelectOption = (stepId, optionId, acrescimo) => {
        setSelections({
            ...selections,
            [stepId]: { id: optionId, acrescimo }
        });
    };

    const handleNextStep = () => {
        const selected = selections[currentStep];
        if (selected) {
            if (currentStep < passos.length - 1) {
                setCurrentStep(currentStep + 1);
            } else {
                setCurrentStep(passos.length);
            }
        } else {
            alert("Por favor, selecione uma opção para continuar.");
        }
    };

    const handleFinalize = async () => {
        const stepMap = {
            0: "passoUmDeCinco",
            1: "passoDoisDeCinco",
            2: "passoTresDeCinco",
            3: "passoQuatroDeCinco",
            4: "passoCincoDeCinco",
        };

        const orderDetails = {};
        passos.forEach((passo, index) => {
            const selectedOptionId = selections[index]?.id;
            if (selectedOptionId !== undefined) {
                const selected = passo.opcoes.find((opt) => opt.id === selectedOptionId);
                if (selected) {
                    const newKey = stepMap[index];
                    orderDetails[newKey] = selected.nome;
                }
            }
        });

        // --- AQUI ESTÁ A PARTE QUE FALTAVA ---
        try {
            const response = await fetch('http://localhost:3001/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderDetails),
            });

            if (response.ok) {
                alert("Pedido enviado para produção com sucesso!");
                // Opcional: Limpar as seleções ou redirecionar
                setSelections({});
                setCurrentStep(0);
            } else {
                const errorData = await response.json();
                alert(`Erro ao enviar pedido: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            alert("Ocorreu um erro ao enviar o pedido. Por favor, tente novamente.");
        }
        // --- FIM DA PARTE QUE FALTAVA ---
    };

    const renderCurrentStep = () => {
        if (currentStep < passos.length) {
            return (
                <MenuSelecao
                    passo={passos[currentStep]}
                    onSelect={(optionId, acrescimo) => handleSelectOption(currentStep, optionId, acrescimo)}
                    selectedOption={selections[currentStep]}
                    onNext={handleNextStep}
                />
            );
        } else {
            return (
                <ResumoPedido
                    selections={selections}
                    passos={passos}
                    onFinalize={handleFinalize}
                />
            );
        }
    };

    return (
        <>
            <style>
                {`
                /* VARIÁVEIS GLOBAIS PARA CONSISTÊNCIA */
                :root {
                    --laranja-vibrante: #FF9D00;
                    --preto: #000000;
                    --azul-selecao: #00BFFF; /* Azul claro/ciano para destaque de seleção */
                    --verde-confirmar: #22C55E;
                    --cinza-claro-fundo: #F5F5F5; /* Usado no Catálogo */
                    --branco: #FFFFFF;
                    --navbar-height: 5rem; /* Consistente com o padding-top do Catalogo */
                }
                
                /* CORREÇÕES GLOBAIS DE LAYOUT E ROLAGEM */
                html { overflow-x: hidden; }
                body, html, #root {
                    margin: 0;
                    padding: 0;
                    width: 100%;
                    min-height: 100vh;
                    overflow-x: hidden;
                    background-color: var(--cinza-claro-fundo); /* Fundo consistente com o Catálogo */
                }
                
                /* Container da Página (Substitui .main-container) */
                .page-container {
                    /* Consistente com .catalogo-page-container */
                    padding-top: var(--navbar-height); 
                    padding-bottom: 2rem;
                    width: 100%; 
                    min-height: 100vh;
                    display: flex;
                    justify-content: center; 
                    align-items: flex-start; 
                    box-sizing: border-box;
                }

                .main-content-card {
                    /* Consistente com .catalogo-main-container */
                    width: 95%; 
                    max-width: 960px; /* Um pouco menor que o catálogo, focando no conteúdo da etapa */
                    background-color: var(--branco);
                    border-radius: 1.5rem; 
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15); 
                    padding: 2.5rem;
                    margin: 1.5rem 0; 
                    position: relative;
                }

                /* Layout interno do Card */
                .card-header-bar {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 1.5rem; /* Ajustado para ser menos intrusivo */
                    background-color: var(--laranja-vibrante);
                    border-top-left-radius: 1.5rem;
                    border-top-right-radius: 1.5rem;
                }
                .title-section {
                    text-align: center;
                    margin-top: 1.5rem;
                    margin-bottom: 2rem;
                }
                .title {
                    font-size: 2.2rem;
                    font-weight: bold;
                    color: var(--laranja-vibrante);
                }
                .subtitle {
                    color: #555;
                    margin-top: 0.5rem;
                    font-size: 1.1rem;
                }
                
                /* Grid de Seleção */
                .selection-grid {
                    display: grid;
                    /* Pelo menos 2 colunas, máximo de 4 em desktop */
                    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); 
                    gap: 1.5rem;
                    margin-top: 2rem;
                }

                .card-option {
                    background-color: var(--cinza-claro-fundo); /* Sutilmente diferente do fundo do card */
                    padding: 1.5rem;
                    text-align: center;
                    border-radius: 0.75rem;
                    transition: all 0.3s ease-in-out;
                    cursor: pointer;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    /* Usa a cor primária para borda padrão */
                    border: 2px solid var(--laranja-vibrante); 
                    position: relative;
                    overflow: hidden;
                    color: inherit;
                    height: 100%; /* Garante altura uniforme */
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
                .card-option:hover {
                    border-color: var(--azul-selecao);
                    transform: translateY(-3px);
                    box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
                }
                .card-option.selected {
                    border-width: 3px;
                    border-color: var(--azul-selecao);
                    background-color: #e6f7ff; /* Cor de fundo mais clara para seleção */
                }
                .card-number {
                    font-size: 1.4rem;
                    font-weight: bold;
                    color: var(--preto);
                }
                .card-price {
                    font-size: 0.9rem;
                    color: #777;
                    margin-top: 0.5rem;
                    font-weight: 500;
                }

                /* Botão de Próximo */
                .next-button-container {
                    display: flex;
                    justify-content: center;
                    margin-top: 3rem;
                }
                .next-button {
                    width: 100%;
                    max-width: 300px; /* Limita o tamanho em desktop */
                    background-color: var(--verde-confirmar);
                    color: white;
                    font-weight: 600;
                    padding: 0.8rem;
                    border-radius: 9999px;
                    border: none;
                    transition: background-color 0.3s;
                    font-size: 1.1rem;
                }
                .next-button:hover {
                    background-color: #1A9C4B;
                }
                .next-button:disabled {
                    background-color: #ccc;
                    cursor: not-allowed;
                }

                /* Resumo do Pedido (Ajustes de consistência) */
                .summary-item {
                    border-left-color: var(--laranja-vibrante);
                }
                .summary-total {
                    background-color: #fff8e1; /* Fundo diferente para o total */
                    border: 1px solid var(--laranja-vibrante);
                }
                .total-label, .total-value {
                    color: var(--preto);
                }

                /* RESPONSIVIDADE */
                @media (max-width: 768px) {
                    :root {
                        --navbar-height: 4.5rem; /* Ajuste para Navbar menor */
                    }
                    .page-container {
                        padding-top: var(--navbar-height);
                    }
                    .main-content-card {
                        padding: 1.5rem;
                        margin: 1rem 0;
                    }
                    .title {
                        font-size: 1.8rem;
                    }
                    .selection-grid {
                        /* Força 2 colunas para melhor aproveitamento do espaço em tablets */
                        grid-template-columns: 1fr 1fr; 
                        gap: 1rem;
                    }
                }

                @media (max-width: 480px) {
                    .main-content-card {
                        padding: 1rem;
                        margin: 0.5rem 0;
                        border-radius: 1rem;
                    }
                    .title {
                        font-size: 1.5rem;
                    }
                    .selection-grid {
                        /* Apenas 1 coluna em celulares muito pequenos */
                        grid-template-columns: 1fr; 
                    }
                }
                `}
            </style>
            
            <Navbar /> {/* Adicionada a Navbar */}

            <div className="page-container">
                <div className="main-content-card">
                    <div className="card-header-bar"></div>
                    {/* O renderCurrentStep contém o conteúdo do card */}
                    {renderCurrentStep()}
                </div>
            </div>
        </>
    );
};

export default PaginaCriarSneaker;