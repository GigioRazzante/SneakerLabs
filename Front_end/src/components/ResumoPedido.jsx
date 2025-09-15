import React from 'react';

const ResumoPedido = ({ selections, passos, onFinalize }) => {
  const calcularPrecoTotal = () => {
    let precoTotal = 0;
    // Itera sobre os passos para somar os acréscimos das opções selecionadas
    passos.forEach((passo, stepIndex) => {
      const selectedOption = selections[stepIndex];
      if (selectedOption) {
        // Acessa o acrescimo da opção selecionada
        precoTotal += selectedOption.acrescimo;
      }
    });
    return precoTotal.toFixed(2);
  };

  // Reestrutura o resumo para exibir os detalhes
  const resumoDetalhado = [];
  passos.forEach((passo, stepIndex) => {
    const selectedOptionData = selections[stepIndex];
    if (selectedOptionData) {
      const optionDetails = passo.opcoes.find(opt => opt.id === selectedOptionData.id);
      if (optionDetails) {
        resumoDetalhado.push({
          categoria: passo.titulo.split(':')[1].trim(), // Pega apenas a parte depois do "Passo X de Y:"
          nome: optionDetails.nome,
          preco: optionDetails.preco,
        });
      }
    }
  });


  return (
    <div className="card-container">
      <div className="card-header-bar"></div>

      <div className="title-section">
        <h1 className="title">Seu Sneaker Está Pronto!</h1>
        <p className="subtitle">Resumo do Pedido</p>
      </div>

      <div className="summary-list">
        {resumoDetalhado.map((item, index) => (
          <div key={index} className="summary-item">
            <span className="summary-label">{item.categoria}:</span>
            <span className="summary-value">{item.nome} ({item.preco})</span>
          </div>
        ))}
      </div>

      <div className="summary-total">
        <h2 className="total-label">Preço Total:</h2>
        <span className="total-value">R$ {calcularPrecoTotal()}</span>
      </div>

      <div className="next-button-container">
        <button
          className="next-button"
          onClick={onFinalize} // Chama a função assíncrona do PaginaCriarSneaker
        >
          Enviar Pedido
        </button>
      </div>
    </div>
  );
};

export default ResumoPedido;