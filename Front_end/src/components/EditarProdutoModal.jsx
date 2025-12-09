// components/EditarProdutoModal.jsx
import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://sneakerslab-backend.onrender.com';

const EditarProdutoModal = ({ produto, pedidoId, onSave, onClose }) => {
  const [selections, setSelections] = useState({});
  const [loading, setLoading] = useState(false);

  // Passos para edição (mesma estrutura do criar sneaker)
  const passos = [
    {
      titulo: "Passo 1 de 5: Escolha o seu estilo.",
      opcoes: [
        { id: 1, nome: "Casual", preco: "R$ 200", acrescimo: 200 },
        { id: 2, nome: "Corrida", preco: "R$ 350", acrescimo: 350 },
        { id: 3, nome: "Skate", preco: "R$ 300", acrescimo: 300 }
      ],
    },
    {
      titulo: "Passo 2 de 5: Escolha o material.",
      opcoes: [
        { id: 1, nome: "Couro", preco: "+ R$ 100", acrescimo: 100 },
        { id: 2, nome: "Camurça", preco: "+ R$ 120", acrescimo: 120 },
        { id: 3, nome: "Tecido", preco: "+ R$ 90", acrescimo: 90 }
      ],
    },
    {
      titulo: "Passo 3 de 5: Escolha o solado.",
      opcoes: [
        { id: 1, nome: "Borracha", preco: "+ R$ 40", acrescimo: 40 },
        { id: 2, nome: "EVA", preco: "+ R$ 60", acrescimo: 60 },
        { id: 3, nome: "Air", preco: "+ R$ 90", acrescimo: 90 }
      ],
    },
    {
      titulo: "Passo 4 de 5: Escolha a cor.",
      opcoes: [
        { id: 1, nome: "Branco", preco: "+ R$ 20", acrescimo: 20, background: "#FFFFFF" },
        { id: 2, nome: "Preto", preco: "+ R$ 30", acrescimo: 30, background: "#000000" },
        { id: 3, nome: "Azul", preco: "+ R$ 25", acrescimo: 25, background: "#007BFF" },
        { id: 4, nome: "Vermelho", preco: "+ R$ 28", acrescimo: 28, background: "#DC3545" },
        { id: 5, nome: "Verde", preco: "+ R$ 23", acrescimo: 23, background: "#28A745" },
        { id: 6, nome: "Amarelo", preco: "+ R$ 30", acrescimo: 30, background: "#FFC107" }
      ],
    },
    {
      titulo: "Passo 5 de 5: Adicione detalhes.",
      opcoes: [
        { id: 1, nome: "Cadarço normal", preco: "+ R$ 20", acrescimo: 20 },
        { id: 2, nome: "Cadarço colorido", preco: "+ R$ 30", acrescimo: 30 },
        { id: 3, nome: "Sem cadarço", preco: "+ R$ 35", acrescimo: 35 }
      ],
    },
  ];

  // Carregar seleções atuais do produto
  useEffect(() => {
    if (produto) {
      const currentSelections = {};
      
      // Mapear as configurações atuais do produto para o formato de selections
      if (produto.passo_um) {
        const opcao = passos[0].opcoes.find(opt => opt.nome === produto.passo_um);
        if (opcao) currentSelections[0] = { id: opcao.id, acrescimo: opcao.acrescimo };
      }
      if (produto.passo_dois) {
        const opcao = passos[1].opcoes.find(opt => opt.nome === produto.passo_dois);
        if (opcao) currentSelections[1] = { id: opcao.id, acrescimo: opcao.acrescimo };
      }
      if (produto.passo_tres) {
        const opcao = passos[2].opcoes.find(opt => opt.nome === produto.passo_tres);
        if (opcao) currentSelections[2] = { id: opcao.id, acrescimo: opcao.acrescimo };
      }
      if (produto.passo_quatro) {
        const opcao = passos[3].opcoes.find(opt => opt.nome === produto.passo_quatro);
        if (opcao) currentSelections[3] = { id: opcao.id, acrescimo: opcao.acrescimo };
      }
      if (produto.passo_cinco) {
        const opcao = passos[4].opcoes.find(opt => opt.nome === produto.passo_cinco);
        if (opcao) currentSelections[4] = { id: opcao.id, acrescimo: opcao.acrescimo };
      }
      
      setSelections(currentSelections);
    }
  }, [produto]);

  const handleSelectOption = (stepId, optionId, acrescimo) => {
    setSelections({
      ...selections,
      [stepId]: { id: optionId, acrescimo }
    });
  };

  const handleSave = async () => {
    if (Object.keys(selections).length !== 5) {
      alert('Por favor, selecione todas as opções para atualizar o produto.');
      return;
    }

    setLoading(true);
    try {
      // Preparar dados para atualização
      const configuracoesAtualizadas = {};
      let valorTotal = 0;

      Object.keys(selections).forEach(stepId => {
        const stepIndex = parseInt(stepId);
        const selectedOption = passos[stepIndex].opcoes.find(opt => opt.id === selections[stepId].id);
        
        if (selectedOption) {
          const stepMap = {
            0: "passo_um",
            1: "passo_dois", 
            2: "passo_tres",
            3: "passo_quatro",
            4: "passo_cinco",
          };
          
          configuracoesAtualizadas[stepMap[stepIndex]] = selectedOption.nome;
          valorTotal += selectedOption.acrescimo;
        }
      });

      // Chamar API para atualizar
      const response = await fetch(`${API_BASE_URL}/api/produtos/editar/${produto.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...configuracoesAtualizadas,
          valor: valorTotal
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar produto');
      }

      const data = await response.json();
      onSave(data.produto, data.valorTotal);
      
    } catch (error) {
      console.error('Erro ao editar produto:', error);
      alert('Erro ao editar produto: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Calcular valor total atual
  const valorTotal = Object.values(selections).reduce((total, selection) => {
    return total + (selection?.acrescimo || 0);
  }, 0);

  const todosSelecionados = Object.keys(selections).length === 5;

  return (
    <>
      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 1rem;
        }
        
        .modal-content {
          background: white;
          border-radius: 1.5rem;
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          position: relative;
        }
        
        .modal-header {
          background: #FF9D00;
          color: white;
          padding: 1.5rem;
          border-top-left-radius: 1.5rem;
          border-top-right-radius: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .modal-title {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0;
        }
        
        .close-button {
          background: none;
          border: none;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .close-button:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .modal-body {
          padding: 2rem;
        }
        
        .steps-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          margin-bottom: 2rem;
        }
        
        .step-section {
          border: 2px solid #e9ecef;
          border-radius: 0.75rem;
          padding: 1.5rem;
        }
        
        .step-title {
          font-size: 1.2rem;
          font-weight: 600;
          color: #FF9D00;
          margin-bottom: 1rem;
          border-bottom: 2px solid #FF9D00;
          padding-bottom: 0.5rem;
        }
        
        .step-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }
        
        .step-option {
          padding: 1rem;
          border: 2px solid #FF9D00;
          border-radius: 0.5rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: white;
        }
        
        .step-option:hover {
          background: #fff8e1;
          transform: translateY(-2px);
        }
        
        .step-option.selected {
          background: #FF9D00;
          color: white;
          border-color: #FF9D00;
        }
        
        .option-name {
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        
        .option-price {
          font-size: 0.9rem;
          opacity: 0.8;
        }
        
        .color-option {
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #333;
          font-weight: 600;
        }
        
        .color-option.selected {
          color: white;
        }
        
        .modal-footer {
          padding: 1.5rem 2rem;
          border-top: 2px solid #e9ecef;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f8f9fa;
          border-bottom-left-radius: 1.5rem;
          border-bottom-right-radius: 1.5rem;
        }
        
        .total-section {
          font-size: 1.2rem;
          font-weight: 600;
        }
        
        .total-label {
          color: #666;
        }
        
        .total-value {
          color: #FF9D00;
        }
        
        .modal-actions {
          display: flex;
          gap: 1rem;
        }
        
        .save-button {
          background: #22C55E;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s;
        }
        
        .save-button:hover:not(:disabled) {
          background: #1A9C4B;
        }
        
        .save-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        
        .cancel-button {
          background: #6c757d;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s;
        }
        
        .cancel-button:hover {
          background: #545b62;
        }
        
        .loading-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid #ffffff;
          border-radius: 50%;
          border-top-color: transparent;
          animation: spin 1s ease-in-out infinite;
          margin-right: 0.5rem;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .modal-content {
            margin: 1rem;
            max-height: 95vh;
          }
          
          .modal-body {
            padding: 1rem;
          }
          
          .step-options {
            grid-template-columns: 1fr 1fr;
          }
          
          .modal-footer {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }
          
          .modal-actions {
            justify-content: center;
          }
        }
      `}</style>

      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title">Editar Sneaker</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          
          <div className="modal-body">
            <div className="steps-container">
              {passos.map((passo, stepIndex) => (
                <div key={stepIndex} className="step-section">
                  <h3 className="step-title">{passo.titulo}</h3>
                  <div className="step-options">
                    {passo.opcoes.map((opcao, optionIndex) => {
                      const isSelected = selections[stepIndex]?.id === opcao.id;
                      const isColorStep = stepIndex === 3;
                      
                      return (
                        <div
                          key={optionIndex}
                          className={`step-option ${isSelected ? 'selected' : ''} ${isColorStep ? 'color-option' : ''}`}
                          onClick={() => handleSelectOption(stepIndex, opcao.id, opcao.acrescimo)}
                          style={isColorStep ? { backgroundColor: opcao.background } : {}}
                        >
                          <div className="option-name">{opcao.nome}</div>
                          <div className="option-price">{opcao.preco}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="modal-footer">
            <div className="total-section">
              <span className="total-label">Valor Total: </span>
              <span className="total-value">R$ {valorTotal.toFixed(2)}</span>
            </div>
            
            <div className="modal-actions">
              <button className="cancel-button" onClick={onClose}>
                Cancelar
              </button>
              <button 
                className="save-button" 
                onClick={handleSave}
                disabled={!todosSelecionados || loading}
              >
                {loading && <span className="loading-spinner"></span>}
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditarProdutoModal;