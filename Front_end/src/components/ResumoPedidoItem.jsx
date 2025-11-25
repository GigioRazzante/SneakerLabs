import React from 'react';
import { useTheme } from '../context/ThemeContext.jsx'; // 🎨 NOVO IMPORT

const ResumoPedidoItem = ({ pedido, valorTotal }) => {
    const { primaryColor } = useTheme(); // 🎨 HOOK DO TEMA
    
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
                    border-left: 4px solid var(--primary-color, #FF9D00); /* 🎨 VARIÁVEL CSS */
                    transition: border-color 0.3s ease; /* 🎨 TRANSITION SUAVE */
                }
                
                .summary-title {
                    color: var(--primary-color, #FF9D00); /* 🎨 VARIÁVEL CSS */
                    font-size: 1.2rem;
                    font-weight: bold;
                    margin-bottom: 1rem;
                    border-bottom: 2px solid var(--primary-color, #FF9D00); /* 🎨 VARIÁVEL CSS */
                    padding-bottom: 0.5rem;
                    transition: all 0.3s ease; /* 🎨 TRANSITION SUAVE */
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
                    border-top: 2px solid var(--primary-color, #FF9D00); /* 🎨 VARIÁVEL CSS */
                    font-weight: bold;
                    font-size: 1.1rem;
                    transition: border-color 0.3s ease; /* 🎨 TRANSITION SUAVE */
                }
                
                .total-value {
                    color: var(--primary-color, #FF9D00); /* 🎨 VARIÁVEL CSS */
                    transition: color 0.3s ease; /* 🎨 TRANSITION SUAVE */
                }
                
                /* 🎨 ESTILOS PARA DESTAQUES */
                .cart-summary:hover {
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    transform: translateY(-2px);
                    transition: all 0.3s ease;
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
                    
                    .summary-title {
                        font-size: 1.1rem;
                    }
                }
                
                @media (max-width: 480px) {
                    .cart-summary {
                        padding: 0.75rem;
                    margin: 0.5rem 0;
                    border-left-width: 3px;
                    border-radius: 0.5rem;
                    }
                    
                    .summary-title {
                        font-size: 1rem;
                        margin-bottom: 0.75rem;
                        padding-bottom: 0.25rem;
                    }
                    
                    .cart-item {
                        margin-bottom: 0.25rem;
                        padding-bottom: 0.25rem;
                    }
                    
                    .cart-total {
                        margin-top: 0.75rem;
                        padding-top: 0.25rem;
                        font-size: 1rem;
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
                    <span className="total-value">R$ {valorTotal.toFixed(2)}</span>
                </div>
            </div>
        </>
    );
};

export default ResumoPedidoItem;