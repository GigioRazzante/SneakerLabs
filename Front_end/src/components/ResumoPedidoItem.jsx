import React from 'react';

const ResumoPedidoItem = ({ pedido, valorTotal }) => {
    // 🚨 CORREÇÃO: Validar pedido antes de renderizar
    if (!pedido || !Array.isArray(pedido.items) || pedido.items.length === 0) {
        return (
            <div className="cart-summary">
                <h3 className="summary-title">Resumo do Pedido</h3>
                <p>Erro: Itens do pedido não disponíveis ou estrutura inválida</p>
                <p>Pedido recebido: {JSON.stringify(pedido)}</p>
            </div>
        );
    }

    return (
        <>
            <style>{`
                .cart-summary {
                    background-color: #F5F5F5;
                    border-radius: 0.75rem;
                    padding: 1.5rem;
                    margin: 1rem 0;
                    border-left: 4px solid #FF9D00;
                }
                
                .summary-title {
                    color: #FF9D00;
                    font-size: 1.2rem;
                    font-weight: bold;
                    margin-bottom: 1rem;
                    border-bottom: 2px solid #FF9D00;
                    padding-bottom: 0.5rem;
                }
                
                .cart-item {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 0.5rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid #ddd;
                }
                
                .item-category {
                    font-weight: 500;
                    color: #000000;
                }
                
                .item-choice {
                    font-weight: 600;
                    color: #000000;
                }
                
                .cart-total {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 1rem;
                    padding-top: 0.5rem;
                    border-top: 2px solid #FF9D00;
                    font-weight: bold;
                    font-size: 1.1rem;
                }
                
                @media (max-width: 768px) {
                    .cart-summary {
                        padding: 1rem;
                    }
                    
                    .cart-item {
                        flex-direction: column;
                        gap: 0.25rem;
                    }
                    
                    .cart-total {
                        flex-direction: column;
                        gap: 0.5rem;
                        text-align: center;
                    }
                }
            `}</style>

            <div className="cart-summary">
                <h3 className="summary-title">Resumo do Pedido</h3>
                {pedido.items.map((item, index) => (
                    <div key={index} className="cart-item">
                        <span className="item-category">Passo {item.step}:</span>
                        <span className="item-choice">{item.name} (+R$ {item.acrescimo?.toFixed(2) || '0.00'})</span>
                    </div>
                ))}
                <div className="cart-total">
                    <span>Total do Sneaker:</span>
                    <span>R$ {valorTotal.toFixed(2)}</span>
                </div>
            </div>
        </>
    );
};

export default ResumoPedidoItem;