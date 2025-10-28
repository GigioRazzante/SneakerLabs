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
    );
};

export default ResumoPedidoItem;