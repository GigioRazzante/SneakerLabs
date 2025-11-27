import React from 'react';
import { useTheme } from '../context/ThemeContext.jsx';

const ResumoPedidoItem = ({ pedido, valorTotal }) => {
    const { primaryColor } = useTheme();
    
    // 🚨 CORREÇÃO: Validar pedido antes de renderizar
    if (!pedido || !Array.isArray(pedido.items) || pedido.items.length === 0) {
        return (
            <div className="resumo-container">
                <h3 className="resumo-title">Resumo do Pedido</h3>
                <p className="error-message">Erro: Itens do pedido não disponíveis ou estrutura inválida</p>
            </div>
        );
    }

    return (
        <>
            <style>{`
                .resumo-container {
                    background: white;
                    border-radius: 1.5rem;
                    padding: 2rem;
                    margin: 2rem 0;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                    border: 2px solid #f8f9fa;
                    position: relative;
                    overflow: hidden;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .resumo-container:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
                    border-color: var(--primary-color);
                }
                
                .resumo-title {
                    font-size: 2rem;
                    font-weight: 800;
                    color: var(--primary-color);
                    margin-bottom: 1.5rem;
                    background: linear-gradient(135deg, var(--primary-color) 0%, #ffb347 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    padding-bottom: 0.5rem;
                    border-bottom: 3px solid var(--primary-color);
                }
                
                .resumo-items {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }
                
                .resumo-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 1.5rem;
                    background: #f8f9fa;
                    border-radius: 1rem;
                    transition: all 0.3s ease;
                    border-left: 4px solid transparent;
                }
                
                .resumo-item:hover {
                    background: #e9ecef;
                    border-left-color: var(--primary-color);
                    transform: translateX(5px);
                }
                
                .item-info {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }
                
                .item-category {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #666;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .item-choice {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #000000;
                }
                
                .item-price {
                    font-size: 1rem;
                    font-weight: 600;
                    color: var(--primary-color);
                    background: rgba(var(--primary-color-rgb), 0.1);
                    padding: 0.4rem 0.8rem;
                    border-radius: 2rem;
                }
                
                .resumo-total {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 2rem;
                    padding-top: 1.5rem;
                    border-top: 2px dashed var(--primary-color);
                    font-weight: 700;
                    font-size: 1.3rem;
                }
                
                .total-label {
                    color: #000000;
                }
                
                .total-value {
                    color: var(--primary-color);
                    background: linear-gradient(135deg, var(--primary-color) 0%, #ffb347 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    padding: 0.5rem 1rem;
                    border-radius: 1rem;
                    border: 2px solid rgba(var(--primary-color-rgb), 0.2);
                }
                
                .error-message {
                    color: #dc3545;
                    font-weight: 600;
                    text-align: center;
                    padding: 1rem;
                    background: rgba(220, 53, 69, 0.1);
                    border-radius: 0.75rem;
                    border: 1px solid rgba(220, 53, 69, 0.2);
                }
                
                /* Indicador de hover igual ao catálogo */
                .resumo-container::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 4px;
                    background: var(--primary-color);
                    transform: scaleX(0);
                    transition: transform 0.3s ease;
                    border-radius: 0 0 1.5rem 1.5rem;
                }
                
                .resumo-container:hover::after {
                    transform: scaleX(1);
                }

                /* === RESPONSIVIDADE NO ESTILO DO CATÁLOGO === */
                
                /* Tablets */
                @media (max-width: 1024px) {
                    .resumo-container {
                        padding: 1.5rem;
                        margin: 1.5rem 0;
                    }
                    
                    .resumo-title {
                        font-size: 1.8rem;
                    }
                    
                    .resumo-item {
                        padding: 0.8rem 1.2rem;
                    }
                }

                @media (max-width: 768px) {
                    .resumo-container {
                        padding: 1.5rem;
                        margin: 1rem 0;
                    }
                    
                    .resumo-title {
                        font-size: 1.6rem;
                    margin-bottom: 1.2rem;
                    padding-bottom: 0.5rem;
                    border-bottom-width: 2px;
                    }
                    
                    .resumo-item {
                        padding: 0.8rem 1rem;
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.5rem;
                    }
                    
                    .item-price {
                        align-self: flex-end;
                    }
                    
                    .resumo-total {
                        flex-direction: column;
                        gap: 1rem;
                        text-align: center;
                        margin-top: 1.5rem;
                        padding-top: 1rem;
                    }
                    
                    .total-value {
                        font-size: 1.4rem;
                    }
                }

                /* Mobile */
                @media (max-width: 640px) {
                    .resumo-container {
                        padding: 1.2rem;
                        margin: 0.8rem 0;
                        border-radius: 1rem;
                    }
                    
                    .resumo-title {
                        font-size: 1.4rem;
                    margin-bottom: 1rem;
                    padding-bottom: 0.5rem;
                    }
                    
                    .resumo-items {
                        gap: 0.8rem;
                    }
                    
                    .resumo-item {
                        padding: 0.7rem 0.9rem;
                    }
                    
                    .item-choice {
                        font-size: 1rem;
                    }
                    
                    .item-price {
                        font-size: 0.9rem;
                        padding: 0.3rem 0.6rem;
                    }
                    
                    .resumo-total {
                        font-size: 1.1rem;
                        margin-top: 1.2rem;
                        padding-top: 1rem;
                    }
                    
                    .total-value {
                        font-size: 1.2rem;
                        padding: 0.4rem 0.8rem;
                    }
                }

                @media (max-width: 480px) {
                    .resumo-container {
                        padding: 1rem;
                        margin: 0.5rem 0;
                    }
                    
                    .resumo-title {
                        font-size: 1.3rem;
                    margin-bottom: 0.8rem;
                    padding-bottom: 0.4rem;
                    }
                    
                    .resumo-item {
                        padding: 0.6rem 0.8rem;
                    }
                    
                    .item-category {
                        font-size: 0.8rem;
                    }
                    
                    .item-choice {
                        font-size: 0.9rem;
                    }
                    
                    .resumo-total {
                        font-size: 1rem;
                    }
                    
                    .total-value {
                        font-size: 1.1rem;
                    }
                }
            `}</style>

            <div className="resumo-container">
                <h3 className="resumo-title">Resumo do Pedido</h3>
                <div className="resumo-items">
                    {pedido.items.map((item, index) => (
                        <div key={index} className="resumo-item">
                            <div className="item-info">
                                <span className="item-category">Passo {item.step}</span>
                                <span className="item-choice">{item.name}</span>
                            </div>
                            <span className="item-price">+R$ {item.acrescimo?.toFixed(2) || '0.00'}</span>
                        </div>
                    ))}
                </div>
                <div className="resumo-total">
                    <span className="total-label">Total do Sneaker:</span>
                    <span className="total-value">R$ {valorTotal.toFixed(2)}</span>
                </div>
            </div>
        </>
    );
};

export default ResumoPedidoItem;