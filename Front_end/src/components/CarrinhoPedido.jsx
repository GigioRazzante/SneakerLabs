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
                        className="add-more-button"
                        onClick={onIncluirMaisPedidos}
                    >
                        ➕ Começar a Personalizar
                    </button>
                </div>
            </div>
        );
    }

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

                {/* Botões de ação */}
                <div className="cart-actions">
                    <button 
                        className="confirm-button"
                        onClick={handleConfirmarPedidos}
                        disabled={pedidos.length === 0}
                    >
                        ✅ Confirmar {pedidos.length} Pedido(s) - R$ {totalGeral.toFixed(2)}
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