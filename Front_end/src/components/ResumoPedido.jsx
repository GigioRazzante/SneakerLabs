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

    return (
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
                    onClick={onFinalize}
                >
                    Enviar Pedido para Produção
                </button>
            </div>
        </div>
    );
};

export default ResumoPedido;