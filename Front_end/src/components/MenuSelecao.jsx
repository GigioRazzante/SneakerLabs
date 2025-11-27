import React from 'react';
import { useTheme } from '../context/ThemeContext.jsx';

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
  const passoIndex = parseInt(passo.titulo.split(' ')[1]) - 1;
  const isColorStep = passoIndex === 3; // Passo 4 (índice 3) é a cor
  const { primaryColor } = useTheme();

  return (
    <>
      {/* Header Bar com cor do tema */}
      <div 
        className="card-header-bar" 
        style={{ backgroundColor: primaryColor }}
      ></div> 
      
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

              <div className="card-content">
                <span className="card-title">{opcao.nome}</span>
                <p className="card-price">{opcao.preco}</p>
              </div>

              {/* Indicador de seleção igual ao catálogo */}
              <div className="card-hover-indicator" style={{ backgroundColor: primaryColor }}></div>
            </div>
          );
        })}
      </div>

      <div className="next-button-container">
        <button
          className="next-button"
          onClick={onNext}
          disabled={!selectedOption}
          style={{ backgroundColor: primaryColor }}
        >
          Próximo
        </button>
      </div>

      <style>{`
        /* === ESTRUTURA PRINCIPAL - ESTILO CATÁLOGO === */
        .card-header-bar {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 8px;
          background-color: var(--primary-color);
          border-top-left-radius: 1.5rem;
          border-top-right-radius: 1.5rem;
        }
        
        .title-section {
          text-align: center;
          margin: 3rem 0 2rem 0;
        }

        .title {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--primary-color);
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, var(--primary-color) 0%, #ffb347 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .subtitle {
          color: #666;
          font-size: 1.3rem;
          font-weight: 500;
        }

        /* === GRID NO ESTILO DO CATÁLOGO === */
        .selection-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin: 3rem 0;
        }

        .card-option {
          background: white;
          padding: 2rem 1.5rem;
          text-align: center;
          border-radius: 1.5rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 2px solid #f8f9fa;
          position: relative;
          overflow: hidden;
          min-height: 200px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 100%);
          z-index: 1;
          transition: all 0.3s ease;
        }

        .card-option:hover .image-overlay {
          background: linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%);
        }

        .card-content {
          position: relative;
          z-index: 2;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        /* FONTES E PROPORÇÕES IGUAIS AO CATÁLOGO */
        .card-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
          line-height: 1.2;
        }

        .card-price {
          font-size: 1.1rem;
          font-weight: 600;
          color: white;
          text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7);
          background: rgba(0, 0, 0, 0.8);
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          backdrop-filter: blur(10px);
          margin: 0;
        }

        /* EFEITOS HOVER NO ESTILO DO CATÁLOGO */
        .card-option:hover {
          border-color: var(--primary-color);
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .card-option.selected {
          border-width: 3px;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 4px rgba(var(--primary-color-rgb), 0.2);
          transform: scale(1.02);
        }

        /* INDICADOR DE HOVER IGUAL AO CATÁLOGO */
        .card-hover-indicator {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 4px;
          transform: scaleX(0);
          transition: transform 0.3s ease;
          border-radius: 0 0 1.5rem 1.5rem;
        }

        .card-option:hover .card-hover-indicator {
          transform: scaleX(1);
        }

        .card-option.selected .card-hover-indicator {
          transform: scaleX(1);
        }

        /* AJUSTES PARA CARDS DE COR - ESTILO CATÁLOGO */
        .card-option[style*="background-color"] {
          color: #000000;
        }

        .card-option[style*="background-color"] .card-title,
        .card-option[style*="background-color"] .card-price {
          color: inherit;
          text-shadow: none;
        }

        .card-option[style*="background-color"] .card-price {
          background: rgba(255, 255, 255, 0.9);
          color: #1A1A1A;
        }

        .card-option[style*="#FFFFFF"] .card-title,
        .card-option[style*="#FFFFFF"] .card-price,
        .card-option[style*="#FFC107"] .card-title, 
        .card-option[style*="#FFC107"] .card-price {
          color: #000000;
          text-shadow: none;
        }

        .card-option[style*="#000000"] .card-title, 
        .card-option[style*="#000000"] .card-price {
          color: white;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
        }

        /* === BOTÃO PRÓXIMO NO ESTILO DO CATÁLOGO === */
        .next-button-container {
          display: flex;
          justify-content: center;
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 2px dashed #E5E7EB;
        }

        .next-button {
          width: 100%;
          max-width: 300px;
          background-color: var(--primary-color);
          color: white;
          font-weight: 700;
          padding: 1.2rem 2rem;
          border-radius: 1rem;
          border: none;
          transition: all 0.3s ease;
          font-size: 1.2rem;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.3);
        }

        .next-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(var(--primary-color-rgb), 0.4);
          opacity: 0.95;
        }

        .next-button:disabled {
          background: #9CA3AF;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        /* === RESPONSIVIDADE NO ESTILO DO CATÁLOGO === */
        
        /* Tablets */
        @media (max-width: 1024px) {
          .selection-grid {
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 1.5rem;
          }
          
          .title {
            font-size: 2.2rem;
          }
          
          .card-option {
            min-height: 180px;
            padding: 1.5rem 1rem;
          }
        }

        @media (max-width: 768px) {
          .selection-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.2rem;
          }
          
          .title {
            font-size: 2rem;
          }
          
          .subtitle {
            font-size: 1.1rem;
          }
          
          .card-option {
            min-height: 160px;
            padding: 1.5rem 1rem;
          }
          
          .card-title {
            font-size: 1.3rem;
          }
        }

        /* Mobile */
        @media (max-width: 640px) {
          .selection-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          
          .title {
            font-size: 1.8rem;
          }
          
          .card-option {
            min-height: 140px;
            padding: 1.5rem 1rem;
          }
          
          .next-button {
            padding: 1rem 1.5rem;
            font-size: 1.1rem;
          }
        }

        @media (max-width: 480px) {
          .title {
            font-size: 1.6rem;
          }
          
          .subtitle {
            font-size: 1rem;
          }
          
          .card-title {
            font-size: 1.2rem;
          }
          
          .card-price {
            font-size: 1rem;
            padding: 0.4rem 0.8rem;
          }
        }
      `}</style>
    </>
  );
};

export default MenuSelecao;