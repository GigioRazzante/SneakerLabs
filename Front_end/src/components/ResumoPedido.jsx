import React from 'react';

const ResumoPedido = ({ selections, passos, onFinalize }) => {
    // Cálculo do valor total
    let total = 0;
    const items = Object.keys(selections).map(stepId => {
        const stepIndex = parseInt(stepId, 10);
        const selectedOptionId = selections[stepIndex].id;
        const selectedOption = passos[stepIndex].opcoes.find(opt => opt.id === selectedOptionId);
        if (selectedOption) {
            total += selectedOption.acrescimo;
            return {
                title: passos[stepIndex].titulo.split(':')[0].trim(),
                name: selectedOption.nome,
                price: selectedOption.preco,
            };
        }
        return null;
    }).filter(item => item !== null);

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
                        <span className="summary-label">{item.title}:</span>
                        <span className="summary-value">{item.name} {item.price}</span>
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
                    // AQUI ESTÁ A CORREÇÃO:
                    // Adicionando o evento onClick para chamar a função onFinalize
                    onClick={onFinalize}
                >
                    Enviar Pedido
                </button>
            </div>
        </div>
    );
};

export default ResumoPedido;