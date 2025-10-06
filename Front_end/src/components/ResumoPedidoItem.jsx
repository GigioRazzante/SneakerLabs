import React from 'react';

const ResumoPedidoItem = ({ pedido, valorTotal }) => {
    return (
        <div className="cart-summary">
            <h3 className="summary-title">Resumo do Pedido</h3>
            <div className="summary-items">
                {pedido.items.map((item, index) => (
                    <div key={index} className="cart-item">
                        <span className="item-category">{item.category}:</span>
                        <span className="item-choice">{item.name}</span>
                    </div>
                ))}
            </div>
            <div className="cart-total">
                <span className="total-label">Total:</span>
                <span className="total-price">R$ {valorTotal.toFixed(2)}</span>
            </div>
        </div>
    );
};

export default ResumoPedidoItem;