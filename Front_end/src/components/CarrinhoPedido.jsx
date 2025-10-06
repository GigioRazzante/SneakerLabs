import React from 'react';
import ResumoPedidoItem from './ResumoPedidoItem';

const CarrinhoPedido = ({ pedidos, onConfirmarPedidos, onIncluirMaisPedidos }) => {
    // Calcular o total de todos os pedidos
    const totalGeral = pedidos.reduce((total, pedido) => {
        return total + pedido.items.reduce((sum, item) => sum + item.acrescimo, 0);
    }, 0);

    return (
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
                        const totalPedido = pedido.items.reduce((sum, item) => sum + item.acrescimo, 0);
                        
                        return (
                            <div key={pedido.id} className="pedido-item">
                                <div className="pedido-header">
                                    <h3 className="pedido-title">Sneaker #{pedidoIndex + 1}</h3>
                                    <span className="pedido-date">{pedido.dataCriacao}</span>
                                </div>
                                
                                {/* Imagem do sneaker (placeholder) */}
                                <div className="sneaker-image">
                                    <div className="image-placeholder">
                                        <span>👟</span>
                                        <p>Sneaker Personalizado #{pedidoIndex + 1}</p>
                                    </div>
                                </div>

                                {/* Resumo do pedido usando o componente */}
                                <ResumoPedidoItem 
                                    pedido={pedido} 
                                    valorTotal={totalPedido} 
                                />
                                
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

                {/* Botões de ação */}
                <div className="cart-actions">
                    <button 
                        className="confirm-button"
                        onClick={onConfirmarPedidos}
                        disabled={pedidos.length === 0}
                    >
                        ✅ Confirmar {pedidos.length} Pedido(s)
                    </button>
                    <button 
                        className="add-more-button"
                        onClick={onIncluirMaisPedidos}
                    >
                        ➕ Incluir Mais um Sneaker
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CarrinhoPedido;