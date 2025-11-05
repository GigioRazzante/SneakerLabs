import React from 'react';

const ResumoPedido = ({ selections, passos, onFinalize }) => {
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
                    background-color: #FF9D00;
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
                    color: #FF9D00;
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
                    border-left: 4px solid #FF9D00;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
                    color: #FF9D00;
                    font-size: 0.9rem;
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
                    background-color: #fff8e1;
                    border: 2px solid #FF9D00;
                    border-radius: 0.75rem;
                    padding: 1.5rem;
                    margin-top: 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-weight: bold;
                    font-size: 1.2rem;
                }
                
                .total-label {
                    color: #000000;
                }
                
                .total-value {
                    color: #FF9D00;
                }
                
                .next-button-container {
                    display: flex;
                    justify-content: center;
                    margin-top: 3rem;
                }
                
                .next-button {
                    width: 100%;
                    max-width: 300px;
                    background-color: #22C55E;
                    color: white;
                    font-weight: 600;
                    padding: 0.8rem;
                    border-radius: 9999px;
                    border: none;
                    transition: background-color 0.3s;
                    font-size: 1.1rem;
                    cursor: pointer;
                }
                
                .next-button:hover {
                    background-color: #1A9C4B;
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