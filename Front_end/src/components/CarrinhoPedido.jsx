import React from 'react';
import ResumoPedidoItem from './ResumoPedidoItem';

const CarrinhoPedido = ({ pedidos, onConfirmarPedidos, onIncluirMaisPedidos }) => {
    // 🚨 CORREÇÃO: Adicionar validação completa
    console.log('🔍 [CarrinhoPedido] Pedidos recebidos:', pedidos);
    
    // Validar se pedidos existe e é um array
    if (!pedidos || !Array.isArray(pedidos)) {
        console.error('❌ [CarrinhoPedido] Pedidos é undefined ou não é array:', pedidos);
        return (
            <div className="card-container">
                <div className="card-header-bar"></div>
                <div className="title-section">
                    <h2 className="title">Erro no Carrinho</h2>
                    <p className="subtitle">Não foi possível carregar os pedidos.</p>
                </div>
            </div>
        );
    }

    // 🚨 CORREÇÃO: Calcular o total com validação robusta
    const totalGeral = pedidos.reduce((total, pedido) => {
        if (!pedido) return total;
        
        // Verificar se pedido.items existe e é array
        const itemsValidos = pedido.items && Array.isArray(pedido.items);
        const valorPedido = pedido.valorTotal || 
                           (itemsValidos ? pedido.items.reduce((sum, item) => {
                               if (!item) return sum;
                               return sum + (item.acrescimo || 0);
                           }, 0) : 0);
        
        return total + valorPedido;
    }, 0);

    // 🚨 FUNÇÃO SIMPLIFICADA
    const handleConfirmarPedidos = () => {
        console.log('✅ [CarrinhoPedido] Chamando onConfirmarPedidos...');
        console.log('📦 Número de pedidos:', pedidos.length);
        console.log('💰 Total geral:', totalGeral);
        
        onConfirmarPedidos();
    };

    // 🚨 CORREÇÃO: Se não há pedidos, mostrar mensagem
    if (pedidos.length === 0) {
        return (
            <div className="card-container">
                <div className="card-header-bar"></div>
                <div className="title-section">
                    <h2 className="title">Carrinho Vazio</h2>
                    <p className="subtitle">Adicione sneakers personalizados ao carrinho.</p>
                </div>
                <div className="cart-actions">
                    <button 
                        className="next-button"
                        onClick={onIncluirMaisPedidos}
                        style={{maxWidth: '300px'}}
                    >
                        ➕ Começar a Personalizar
                    </button>
                </div>
            </div>
        );
    }

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
                
                .cart-content {
                    width: 100%;
                }
                
                .pedidos-list {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }
                
                .pedido-item {
                    background: white;
                    border-radius: 1rem;
                    padding: 1.5rem;
                    border: 2px solid #FF9D00;
                }
                
                .pedido-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 2px solid #FF9D00;
                }
                
                .pedido-title {
                    color: #FF9D00;
                    margin: 0;
                    font-size: 1.3rem;
                }
                
                .pedido-date {
                    color: #666;
                    font-size: 0.9rem;
                }
                
                .sneaker-image {
                    text-align: center;
                    margin: 1rem 0;
                }
                
                .image-placeholder {
                    background-color: #F5F5F5;
                    border-radius: 0.75rem;
                    padding: 2rem;
                    border: 2px dashed #FF9D00;
                }
                
                .image-placeholder span {
                    font-size: 4rem;
                    display: block;
                    margin-bottom: 0.5rem;
                }
                
                .image-placeholder p {
                    margin: 0.5rem 0;
                    color: #333;
                    font-weight: 500;
                }
                
                .image-placeholder small {
                    color: #666;
                }
                
                .pedido-divider {
                    border: none;
                    border-top: 2px dashed #FF9D00;
                    margin: 2rem 0;
                }
                
                .total-geral {
                    background-color: #fff8e1;
                    border: 2px solid #FF9D00;
                    border-radius: 1rem;
                    padding: 1.5rem;
                    margin-top: 2rem;
                }
                
                .total-geral-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-weight: bold;
                    font-size: 1.3rem;
                }
                
                .total-geral-label {
                    color: #000000;
                }
                
                .total-geral-value {
                    color: #FF9D00;
                }
                
                .cart-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    width: 100%;
                    max-width: 400px;
                    margin: 2rem auto 0;
                    align-items: center;
                }
                
                .confirm-button-container {
                    display: flex;
                    justify-content: center;
                    width: 100%;
                    margin-bottom: 1rem;
                }
                
                .next-button {
                    width: 100%;
                    max-width: 400px;
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
                
                .next-button:disabled {
                    background-color: #ccc;
                    cursor: not-allowed;
                }
                
                .add-more-button {
                    width: 100%;
                    max-width: 400px;
                    background-color: #FF9D00;
                    color: white;
                    font-weight: 600;
                    padding: 0.8rem;
                    border-radius: 9999px;
                    border: none;
                    transition: background-color 0.3s;
                    font-size: 1.1rem;
                    cursor: pointer;
                }
                
                .add-more-button:hover {
                    background-color: #e68a00;
                }
                
                @media (max-width: 768px) {
                    .pedido-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.5rem;
                    }
                    
                    .pedido-item {
                        padding: 1rem;
                    }
                    
                    .total-geral {
                        padding: 1rem;
                    }
                    
                    .total-geral-content {
                        font-size: 1.1rem;
                        flex-direction: column;
                        gap: 0.5rem;
                        text-align: center;
                    }
                    
                    .title {
                        font-size: 1.8rem;
                    }
                    
                    .cart-actions {
                        max-width: 100%;
                    }
                    
                    .next-button,
                    .add-more-button {
                        max-width: 100%;
                    font-size: 1rem;
                        padding: 0.7rem;
                    }
                }
                
                @media (max-width: 480px) {
                    .title {
                        font-size: 1.5rem;
                    }
                    
                    .image-placeholder {
                        padding: 1.5rem 1rem;
                    }
                    
                    .image-placeholder span {
                        font-size: 3rem;
                    }
                    
                    .next-button,
                    .add-more-button {
                        font-size: 0.95rem;
                        padding: 0.6rem;
                    }
                }
            `}</style>

            <div className="card-container">
                <div className="card-header-bar"></div>
                
                <div className="title-section">
                    <h2 className="title">Meu Carrinho</h2>
                    <p className="subtitle">{pedidos.length} sneaker(s) personalizado(s) no carrinho</p>
                </div>

                <div className="cart-content">
                    {/* Lista de todos os pedidos */}
                    <div className="pedidos-list">
                        {pedidos.map((pedido, pedidoIndex) => {
                            // 🚨 CORREÇÃO: Validar cada pedido individualmente
                            if (!pedido) {
                                console.warn(`⚠️ Pedido ${pedidoIndex} é undefined`);
                                return null;
                            }

                            const itemsValidos = pedido.items && Array.isArray(pedido.items);
                            const totalPedido = pedido.valorTotal || 
                                              (itemsValidos ? pedido.items.reduce((sum, item) => {
                                                  if (!item) return sum;
                                                  return sum + (item.acrescimo || 0);
                                              }, 0) : 0);

                            console.log(`🔍 [CarrinhoPedido] Pedido ${pedidoIndex}:`, {
                                id: pedido.id,
                                items: pedido.items,
                                valorTotal: pedido.valorTotal,
                                calculado: totalPedido
                            });

                            return (
                                <div key={pedido.id || pedidoIndex} className="pedido-item">
                                    <div className="pedido-header">
                                        <h3 className="pedido-title">Sneaker #{pedidoIndex + 1}</h3>
                                        <span className="pedido-date">Valor: R$ {totalPedido.toFixed(2)}</span>
                                    </div>
                                    
                                    {/* Imagem do sneaker (placeholder) */}
                                    <div className="sneaker-image">
                                        <div className="image-placeholder">
                                            <span>👟</span>
                                            <p>Sneaker Personalizado #{pedidoIndex + 1}</p>
                                            <small><strong>R$ {totalPedido.toFixed(2)}</strong></small>
                                        </div>
                                    </div>

                                    {/* 🚨 CORREÇÃO: Só renderizar ResumoPedidoItem se items existir */}
                                    {itemsValidos ? (
                                        <ResumoPedidoItem 
                                            pedido={pedido} 
                                            valorTotal={totalPedido} 
                                        />
                                    ) : (
                                        <div className="cart-summary">
                                            <h3 className="summary-title">Resumo do Pedido</h3>
                                            <p>Erro: Itens do pedido não disponíveis</p>
                                        </div>
                                    )}
                                    
                                    {pedidoIndex < pedidos.length - 1 && <hr className="pedido-divider" />}
                                </div>
                            );
                        })}
                    </div>

                    {/* Total Geral */}
                    <div className="total-geral">
                        <div className="total-geral-content">
                            <span className="total-geral-label">Total do Pedido:</span>
                            <span className="total-geral-value">R$ {totalGeral.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Botões de ação - AGORA CENTRALIZADOS */}
                    <div className="cart-actions">
                        <div className="confirm-button-container">
                            <button 
                                className="next-button"
                                onClick={handleConfirmarPedidos}
                                disabled={pedidos.length === 0}
                            >
                                ✅ Confirmar {pedidos.length} Pedido(s) - R$ {totalGeral.toFixed(2)}
                            </button>
                        </div>
                        <button 
                            className="add-more-button"
                            onClick={onIncluirMaisPedidos}
                        >
                            ➕ Incluir Mais um Sneaker
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CarrinhoPedido;