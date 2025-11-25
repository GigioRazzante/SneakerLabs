import React from 'react';
import { useTheme } from '../context/ThemeContext.jsx'; // 🎨 NOVO IMPORT

const ResumoPedido = ({ selections, passos, onFinalize }) => {
    const { primaryColor } = useTheme(); // 🎨 HOOK DO TEMA
    
    // Cálculo do valor total e criação dos itens
    let total = 0;
    const items = Object.keys(selections).map(stepId => {
        const stepIndex = parseInt(stepId, 10);
        const selectedOptionId = selections[stepIndex].id;
        const selectedOption = passos[stepIndex].opcoes.find(opt => opt.id === selectedOptionId);
        
        if (selectedOption) {
            total += selectedOption.acrescimo;
            return {
                step: stepIndex + 1,
                title: passos[stepIndex].titulo.split(':')[1]?.trim() || passos[stepIndex].titulo,
                category: passos[stepIndex].titulo.split(':')[0]?.trim(),
                name: selectedOption.nome,
                price: selectedOption.preco,
                acrescimo: selectedOption.acrescimo
            };
        }
        return null;
    }).filter(item => item !== null);

    // Ordenar os itens pelo passo
    items.sort((a, b) => a.step - b.step);

    // 🚨 CORREÇÃO: Função para enviar dados completos
    const handleFinalizar = () => {
        const pedidoData = {
            items: items,
            valorTotal: total
        };
        
        console.log('📤 [ResumoPedido] Enviando dados para finalização:', pedidoData);
        onFinalize(pedidoData);
    };

    return (
        <>
            <style>{`
                .card-container {
                    width: 100%;
                }
                
                .card-header-bar {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 1.5rem;
                    background-color: var(--primary-color, #FF9D00); /* 🎨 VARIÁVEL CSS */
                    border-top-left-radius: 1.5rem;
                    border-top-right-radius: 1.5rem;
                    transition: background-color 0.3s ease; /* 🎨 TRANSITION SUAVE */
                }
                
                .title-section {
                    text-align: center;
                    margin-top: 1.5rem;
                    margin-bottom: 2rem;
                }
                
                .title {
                    font-size: 2.2rem;
                    font-weight: bold;
                    color: var(--primary-color, #FF9D00); /* 🎨 VARIÁVEL CSS */
                    transition: color 0.3s ease; /* 🎨 TRANSITION SUAVE */
                }
                
                .subtitle {
                    color: #555;
                    margin-top: 0.5rem;
                    font-size: 1.1rem;
                }
                
                .summary-list {
                    margin: 2rem 0;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                
                .summary-item {
                    background-color: #F5F5F5;
                    border-radius: 0.75rem;
                    padding: 1.5rem;
                    border-left: 4px solid var(--primary-color, #FF9D00); /* 🎨 VARIÁVEL CSS */
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    transition: border-color 0.3s ease; /* 🎨 TRANSITION SUAVE */
                }
                
                .summary-item-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                    border-bottom: 1px solid #ddd;
                    padding-bottom: 0.5rem;
                }
                
                .summary-step {
                    font-weight: bold;
                    color: var(--primary-color, #FF9D00); /* 🎨 VARIÁVEL CSS */
                    font-size: 0.9rem;
                    transition: color 0.3s ease; /* 🎨 TRANSITION SUAVE */
                }
                
                .summary-category {
                    font-weight: 600;
                    color: #000000;
                    font-size: 1rem;
                }
                
                .summary-item-details,
                .summary-item-price {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 0.5rem;
                }
                
                .summary-label {
                    font-weight: 500;
                    color: #666;
                }
                
                .summary-value {
                    font-weight: 600;
                    color: #000000;
                }
                
                .summary-total {
                    background-color: var(--primary-light, #fff8e1); /* 🎨 VARIÁVEL CSS */
                    border: 2px solid var(--primary-color, #FF9D00); /* 🎨 VARIÁVEL CSS */
                    border-radius: 0.75rem;
                    padding: 1.5rem;
                    margin-top: 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-weight: bold;
                    font-size: 1.2rem;
                    transition: all 0.3s ease; /* 🎨 TRANSITION SUAVE */
                }
                
                .total-label {
                    color: #000000;
                }
                
                .total-value {
                    color: var(--primary-color, #FF9D00); /* 🎨 VARIÁVEL CSS */
                    transition: color 0.3s ease; /* 🎨 TRANSITION SUAVE */
                }
                
                .next-button-container {
                    display: flex;
                    justify-content: center;
                    margin-top: 3rem;
                }
                
                .next-button {
                    width: 100%;
                    max-width: 300px;
                    background: linear-gradient(135deg, var(--primary-color, #22C55E) 0%, var(--primary-hover, #1A9C4B) 100%); /* 🎨 GRADIENT DINÂMICO */
                    color: white;
                    font-weight: 600;
                    padding: 0.8rem;
                    border-radius: 9999px;
                    border: none;
                    transition: all 0.3s ease; /* 🎨 TRANSITION SUAVE */
                    font-size: 1.1rem;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(var(--primary-color-rgb, 34, 197, 94), 0.3); /* 🎨 SHADOW DINÂMICO */
                }
                
                .next-button:hover {
                    background: linear-gradient(135deg, var(--primary-hover, #1A9C4B) 0%, var(--primary-hover-dark, #15803D) 100%); /* 🎨 GRADIENT HOVER DINÂMICO */
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(var(--primary-color-rgb, 34, 197, 94), 0.4); /* 🎨 SHADOW HOVER DINÂMICO */
                }
                
                .next-button:active {
                    transform: translateY(0);
                }
                
                /* 🎨 ESTILOS PARA ACESSIBILIDADE */
                .next-button:focus {
                    outline: 2px solid white;
                    outline-offset: 2px;
                }
                
                @media (max-width: 768px) {
                    .summary-item {
                        padding: 1rem;
                    }
                    
                    .summary-item-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.25rem;
                    }
                    
                    .summary-total {
                        padding: 1rem;
                        font-size: 1.1rem;
                    }
                    
                    .title {
                        font-size: 1.8rem;
                    }
                    
                    .next-button {
                        max-width: 100%;
                    }
                }
                
                @media (max-width: 480px) {
                    .title {
                        font-size: 1.5rem;
                    }
                    
                    .summary-item-details,
                    .summary-item-price {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.25rem;
                    }
                    
                    .next-button {
                        padding: 1rem;
                        font-size: 1rem;
                    }
                }
            `}</style>

            <div className="card-container">
                <div className="card-header-bar"></div>
                <div className="title-section">
                    <h2 className="title">Resumo do Pedido</h2>
                    <p className="subtitle">Revise suas escolhas antes de finalizar.</p>
                </div>
                
                <div className="summary-list">
                    {items.map((item, index) => (
                        <div key={index} className="summary-item">
                            <div className="summary-item-header">
                                <span className="summary-step">Passo {item.step}</span>
                                <span className="summary-category">{item.category}</span>
                            </div>
                            <div className="summary-item-details">
                                <span className="summary-label">Escolha:</span>
                                <span className="summary-value">{item.name}</span>
                            </div>
                            <div className="summary-item-price">
                                <span className="summary-label">Valor:</span>
                                <span className="summary-value">{item.price}</span>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="summary-total">
                    <span className="total-label">Valor Total:</span>
                    <span className="total-value">R$ {total.toFixed(2)}</span>
                </div>
                
                <div className="next-button-container">
                    <button
                        className="next-button"
                        onClick={handleFinalizar}
                    >
                        Enviar Pedido para Produção
                    </button>
                </div>
            </div>
        </>
    );
};

export default ResumoPedido;