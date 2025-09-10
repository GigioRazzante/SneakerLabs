// src/components/MenuSelecao.jsx
import React from 'react';

const MenuSelecao = ({ passo, onSelect, selectedOption, onNext }) => {
  return (
    <div className="card-container">
      <div className="card-header-bar"></div>

      <div className="title-section">
        <h1 className="title">Criar meu Sneaker</h1>
        <p className="subtitle">{passo.titulo}</p>
      </div>

      <div className="selection-grid">
        {passo.opcoes.map((opcao, index) => (
          <div
            key={index}
            onClick={() => onSelect(opcao.id, opcao.acrescimo)}
            className={`card-option ${selectedOption?.id === opcao.id ? 'selected' : ''}`}
          >
            <span className="card-number">{opcao.nome}</span>
            <p className="card-price">{opcao.preco}</p>
          </div>
        ))}
      </div>

      <div className="next-button-container">
        <button
          className="next-button"
          onClick={onNext}
          disabled={!selectedOption}
        >
          Próximo
        </button>
      </div>
    </div>
  );
};

export default MenuSelecao;