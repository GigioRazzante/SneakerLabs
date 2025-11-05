import React from 'react';

// Importação das Imagens
import estiloCasual from '../assets/estiloCasual.png';
import estiloEsportivo from '../assets/estiloEsportivo.png';
import estiloSkate from '../assets/estiloSkate.png';
import materialCouro from '../assets/materialCouro.png';
import materialCamurca from '../assets/materialCamurca.png';
import materialTecido from '../assets/materialTecido.png';
import soladoBorracha from '../assets/soladoBorracha.png';
import soladoEva from '../assets/soladoEva.png';
import soladoAir from '../assets/soladoAir.png';
import cadarcoNormal from '../assets/cadarcoNormal.png';
import cadarcoColorido from '../assets/cadarcoColorido.png';
import semCadarco from '../assets/semCadarco.png';

// Mapeamento de IDs de opção para os assets importados
const optionBackgrounds = {
  // Passo 1 (Estilo)
  '1-1': estiloCasual,
  '1-2': estiloEsportivo,
  '1-3': estiloSkate,
  // Passo 2 (Material)
  '2-1': materialCouro,
  '2-2': materialCamurca,
  '2-3': materialTecido,
  // Passo 3 (Solado)
  '3-1': soladoBorracha,
  '3-2': soladoEva,
  '3-3': soladoAir,
  // Passo 5 (Detalhes)
  '5-1': cadarcoNormal,
  '5-2': cadarcoColorido,
  '5-3': semCadarco,
};

const MenuSelecao = ({ passo, onSelect, selectedOption, onNext }) => {
  // Extrai o índice do passo do título (ex: "Passo 1 de 5" -> índice 0)
  const passoIndex = parseInt(passo.titulo.split(' ')[1]) - 1;
  const isColorStep = passoIndex === 3; // Passo 4 (índice 3) é a cor

  return (
    <>
      <style>{`
        .card-container {
          width: 100%;
        }
        
        .card-header-bar {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 1.5rem;
          background-color: #FF9D00;
          border-top-left-radius: 1.5rem;
          border-top-right-radius: 1.5rem;
        }
        
        .title-section {
          text-align: center;
          margin-top: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .title {
          font-size: 2.2rem;
          font-weight: bold;
          color: #FF9D00;
        }
        
        .subtitle {
          color: #555;
          margin-top: 0.5rem;
          font-size: 1.1rem;
        }
        
        .selection-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }
        
        .card-option {
          padding: 1.5rem;
          text-align: center;
          border-radius: 0.75rem;
          transition: all 0.3s ease-in-out;
          cursor: pointer;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border: 2px solid #FF9D00;
          position: relative;
          overflow: hidden;
          color: white;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background-color: #F5F5F5;
        }
        
        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.4);
          z-index: 1;
          transition: background-color 0.3s ease;
        }
        
        .card-option:hover .image-overlay {
          background-color: rgba(0, 0, 0, 0.55);
        }
        
        .card-number, .card-price {
          position: relative;
          z-index: 2;
          color: inherit;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
        }
        
        .card-number {
          font-size: 1.4rem;
          font-weight: bold;
        }
        
        .card-price {
          font-size: 0.9rem;
          margin-top: 0.5rem;
          font-weight: 500;
        }
        
        .card-option:hover {
          border-color: #00BFFF;
          transform: translateY(-3px);
          box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
        }
        
        .card-option.selected {
          border-width: 3px;
          border-color: #00BFFF;
          box-shadow: 0 0 0 4px rgba(0, 191, 255, 0.5);
        }
        
        .card-option[style*="#FFFFFF"] {
          border-color: #ccc;
        }
        
        .card-option[style*="#FFFFFF"] .card-number,
        .card-option[style*="#FFFFFF"] .card-price,
        .card-option[style*="#FFC107"] .card-number, 
        .card-option[style*="#FFC107"] .card-price {
          color: #000000;
          text-shadow: none;
        }
        
        .card-option.selected[style*="#000000"] .card-number, 
        .card-option.selected[style*="#000000"] .card-price {
          color: white;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
        }
        
        .next-button-container {
          display: flex;
          justify-content: center;
          margin-top: 3rem;
        }
        
        .next-button {
          width: 100%;
          max-width: 300px;
          background-color: #22C55E;
          color: white;
          font-weight: 600;
          padding: 0.8rem;
          border-radius: 9999px;
          border: none;
          transition: background-color 0.3s;
          font-size: 1.1rem;
          cursor: pointer;
        }
        
        .next-button:hover {
          background-color: #1A9C4B;
        }
        
        .next-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        
        @media (max-width: 768px) {
          .selection-grid {
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }
          
          .title {
            font-size: 1.8rem;
          }
        }
        
        @media (max-width: 480px) {
          .selection-grid {
            grid-template-columns: 1fr;
          }
          
          .title {
            font-size: 1.5rem;
          }
        }
      `}</style>

      <div className="card-container">
        <div className="card-header-bar"></div>

        <div className="title-section">
          <h1 className="title">Criar meu Sneaker</h1>
          <p className="subtitle">{passo.titulo}</p>
        </div>

        <div className="selection-grid">
          {passo.opcoes.map((opcao, index) => {
            const optionKey = `${passoIndex + 1}-${opcao.id}`;
            
            // Define o estilo de fundo
            const style = {};
            if (isColorStep) {
              style.backgroundColor = opcao.background;
            } else if (optionBackgrounds[optionKey]) {
              style.backgroundImage = `url(${optionBackgrounds[optionKey]})`;
              style.backgroundSize = 'cover';
              style.backgroundPosition = 'center';
              style.backgroundRepeat = 'no-repeat';
            }

            return (
              <div
                key={index}
                onClick={() => onSelect(opcao.id, opcao.acrescimo)}
                className={`card-option ${selectedOption?.id === opcao.id ? 'selected' : ''}`}
                style={style}
              >
                {/* Overlay para legibilidade do texto sobre a imagem */}
                {!isColorStep && optionBackgrounds[optionKey] && (
                  <div className="image-overlay"></div>
                )}

                <span className="card-number">{opcao.nome}</span>
                <p className="card-price">{opcao.preco}</p>
              </div>
            );
          })}
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
    </>
  );
};

export default MenuSelecao;