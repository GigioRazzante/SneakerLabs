// src/pages/PaginaCriarSneaker.jsx
import React, { useState } from 'react';
import MenuSelecao from '../components/MenuSelecao';
import ResumoPedido from '../components/ResumoPedido';

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
      { id: 1, nome: "Branco", preco: "+ R$ 20", acrescimo: 20 },
      { id: 2, nome: "Preto", preco: "+ R$ 30", acrescimo: 30 },
      { id: 3, nome: "Azul", preco: "+ R$ 25", acrescimo: 25 },
      { id: 4, nome: "Vermelho", preco: "+ R$ 28", acrescimo: 28 },
      { id: 5, nome: "Verde", preco: "+ R$ 23", acrescimo: 23 },
      { id: 6, nome: "Amarelo", preco: "+ R$ 30", acrescimo: 30 }
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

const PaginaCriarSneaker = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState({});

  const handleSelectOption = (stepId, optionId, acrescimo) => {
    setSelections({
      ...selections,
      [stepId]: { id: optionId, acrescimo }
    });
  };

  const handleNextStep = () => {
    const selected = selections[currentStep];
    if (selected) {
        if (currentStep < passos.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            setCurrentStep(passos.length);
        }
    } else {
        alert("Por favor, selecione uma opção para continuar.");
    }
  };

  const handleFinalize = () => {
      alert("Pedido enviado com sucesso!");
      console.log("Pedido Finalizado:", selections);
  };

  const renderCurrentStep = () => {
      if (currentStep < passos.length) {
          return (
              <MenuSelecao
                  passo={passos[currentStep]}
                  onSelect={(optionId, acrescimo) => handleSelectOption(currentStep, optionId, acrescimo)}
                  selectedOption={selections[currentStep]}
                  onNext={handleNextStep}
              />
          );
      } else {
          return (
              <ResumoPedido
                  selections={selections}
                  passos={passos}
                  onFinalize={handleFinalize}
              />
          );
      }
  };

  return (
    <>
      <style>
        {`
          body, html, #root {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
          }
          .main-container {
            position: relative;
            width: 100%;
            height: 100%;
            padding: 0;
            overflow-y: auto;
          }
          .main-container::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: url(../assets/sneakers-bg.png);
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            opacity: 0.2;
            z-index: 0;
          }
          .content {
            position: relative;
            z-index: 1;
            width: 100%;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
          }
          .card-container {
            background-color: white;
            border-radius: 1rem;
            box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 60rem;
            margin: 6rem auto 0 auto;
            padding: 1.5rem;
            position: relative;
          }
          .card-header-bar {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 2rem;
            background-color: #FF9D00;
            border-top-left-radius: 1rem;
            border-top-right-radius: 1rem;
          }
          .title-section {
            text-align: center;
            margin-top: 1.5rem;
          }
          .title {
            font-size: 1.875rem;
            font-weight: bold;
            color: #FF9D00;
          }
          .subtitle {
            color: #333;
            margin-top: 0.5rem;
          }
          .selection-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 1rem;
            margin-top: 2rem;
          }
          .card-option {
            background-color: white;
            padding: 2rem;
            text-align: center;
            border-radius: 0.75rem;
            transition: all 0.3s ease-in-out;
            cursor: pointer;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border: 2px solid #FF9D00;
          }
          .card-option:hover {
            border-color: #00BFFF;
          }
          .card-option.selected {
            border-width: 3px;
            border-color: #00BFFF;
          }
          .card-number {
            font-size: 2rem;
            font-weight: bold;
            color: #4B5563;
          }
          .card-price {
            font-size: 1rem;
            color: #777;
            margin-top: 0.5rem;
          }
          .next-button-container {
            display: flex;
            justify-content: center;
            margin-top: 2rem;
          }
          .next-button {
            width: 100%;
            background-color: #22C55E;
            color: white;
            font-weight: 600;
            padding: 0.75rem;
            border-radius: 9999px;
            border: none;
            transition: background-color 0.3s;
          }
          .next-button:hover {
            background-color: #1A9C4B;
          }
          .next-button:disabled {
            background-color: #ccc;
            cursor: not-allowed;
          }
          @media (min-width: 768px) {
            .next-button {
              width: 33.3333%;
            }
          }
          .summary-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin-top: 2rem;
          }
          .summary-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            background-color: #f9f9f9;
            border-radius: 0.5rem;
            border-left: 5px solid #FF9D00;
          }
          .summary-label {
            font-weight: bold;
            color: #333;
          }
          .summary-value {
            color: #666;
          }
          .summary-total {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 2rem;
            padding: 1.5rem;
            background-color: #e6f7ff;
            border-radius: 0.5rem;
            border: 1px solid #b3e0ff;
          }
          .total-label {
            font-size: 1.25rem;
            font-weight: bold;
            color: #007bff;
            margin: 0;
          }
          .total-value {
            font-size: 1.25rem;
            font-weight: bold;
            color: #007bff;
          }
        `}
      </style>
      <div id="root">
        <div className="main-container">
          <div className="content">
            {renderCurrentStep()}
          </div>
        </div>
      </div>
    </>
  );
};

export default PaginaCriarSneaker;