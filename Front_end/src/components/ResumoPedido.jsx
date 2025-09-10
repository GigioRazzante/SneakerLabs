// src/components/ResumoPedido.jsx
import React from 'react';

const ResumoPedido = ({ selections, passos, onFinalize }) => {
  const calcularPrecoTotal = () => {
    let precoTotal = 0;
    for (const passo in selections) {
      precoTotal += selections[passo].acrescimo;
    }
    return precoTotal.toFixed(2);
  };

  return (
    <div className="card-container">
      <div className="card-header-bar"></div>

      <div className="title-section">
        <h1 className="title">Seu Sneaker Está Pronto!</h1>
        <p className="subtitle">Resumo do Pedido</p>
      </div>

      <div className="summary-list">
        {Object.keys(selections).map(stepIndex => {
          const passoInfo = passos[stepIndex];
          const selectedOption = passoInfo.opcoes.find(
            (opcao) => opcao.id === selections[stepIndex].id
          );
          return (
            <div key={stepIndex} className="summary-item">
              <span className="summary-label">{passoInfo.titulo.split(':')[1].trim()}</span>
              <span className="summary-value">{selectedOption.nome} ({selectedOption.preco})</span>
            </div>
          );
        })}
      </div>

      <div className="summary-total">
        <h2 className="total-label">Preço Total:</h2>
        <span className="total-value">R$ {calcularPrecoTotal()}</span>
      </div>

      <div className="next-button-container">
        <button className="next-button" onClick={onFinalize}>
          Enviar Pedido
        </button>
      </div>
    </div>
  );
};

export default ResumoPedido;