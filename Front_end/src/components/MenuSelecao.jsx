import React from 'react';
import { useTheme } from '../context/ThemeContext.jsx';

// Importação das Imagens (Certifique-se de que estes paths estão corretos)
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
  const { primaryColor } = useTheme(); // 🎨 HOOK DO TEMA

  return (
    <>
      {/* 🎯 DIV DO HEADER BAR COM COR DINÂMICA */}
      <div 
        className="card-header-bar" 
        style={{ backgroundColor: primaryColor }} // 🎨 COR DINÂMICA
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
                <span className="card-number">{opcao.nome}</span>
                <p className="card-price">{opcao.preco}</p>
              </div>
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

      <style>{`
        /* === ESTILOS ESTRUTURAIS === */
        
        .card-header-bar {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 1.5rem;
          background-color: var(--primary-color, #FF9D00); /* 🎨 VARIÁVEL CSS */
          border-top-left-radius: 1.5rem;
          border-top-right-radius: 1.5rem;
          transition: background-color 0.3s ease; /* 🎨 TRANSITION SUAVE */
        }
        
        .title-section {
          text-align: center;
          margin-top: 1.5rem;
          margin-bottom: 2rem;
        }

        .title {
          font-size: 2.2rem;
          font-weight: bold;
          color: var(--primary-color, #1A1A1A); /* 🎨 COR DINÂMICA */
          margin-bottom: 0.5rem;
          transition: color 0.3s ease; /* 🎨 TRANSITION SUAVE */
        }

        .subtitle {
          color: #666;
          margin-top: 0.5rem;
          font-size: 1.1rem;
          margin-bottom: 1.5rem;
        }

        /* ---------------------------------------------------- */
        /* === GRID DE SELEÇÃO RESPONSIVO - FORÇANDO 3 COLUNAS === */
        /* ---------------------------------------------------- */
        .selection-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); 
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .card-option {
          padding: 2rem 1.5rem;
          text-align: center;
          border-radius: 1rem;
          transition: all 0.3s ease-in-out;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border: 2px solid #E5E7EB;
          position: relative;
          overflow: hidden;
          color: white;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background-color: #F8FAFC;
          min-height: 180px;
        }

        /* Estilos de Overlay, Content, Number, Price, Selected */
        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 100%);
          z-index: 1;
          transition: all 0.3s ease;
          opacity: 0.8;
        }

        .card-option:hover .image-overlay {
          opacity: 0.9;
          background: linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%);
        }

        .card-content {
          position: relative;
          z-index: 2;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        .card-number {
          font-size: 1.5rem;
          font-weight: bold;
          color: white;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
          line-height: 1.2;
        }

        .card-price {
          font-size: 1rem;
          font-weight: 600;
          color: white;
          text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7);
          background: rgba(var(--primary-color-rgb, 255, 157, 0), 0.9); /* 🎨 COR DINÂMICA */
          padding: 0.4rem 0.8rem;
          border-radius: 2rem;
          backdrop-filter: blur(10px);
          transition: background 0.3s ease; /* 🎨 TRANSITION SUAVE */
        }

        .card-option:hover {
          border-color: var(--primary-color, #FF9D00); /* 🎨 COR DINÂMICA */
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }

        .card-option.selected {
          border-width: 3px;
          border-color: var(--primary-color, #00BFFF); /* 🎨 COR DINÂMICA */
          box-shadow: 0 0 0 4px var(--primary-light, rgba(0, 191, 255, 0.3)); /* 🎨 COR LIGHT DINÂMICA */
          transform: scale(1.02);
        }

        /* Ajustes para Cores */
        .card-option[style*="background-color"] {
          color: #000000;
        }

        .card-option[style*="background-color"] .card-number,
        .card-option[style*="background-color"] .card-price {
          color: inherit;
          text-shadow: none;
        }

        .card-option[style*="background-color"] .card-price {
          background: rgba(255, 255, 255, 0.9);
          color: #1A1A1A;
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

        /* === BOTÃO PRÓXIMO === */
        .next-button-container {
          display: flex;
          justify-content: center;
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 2px dashed #E5E7EB;
        }

        .next-button {
          width: 100%;
          max-width: 400px;
          background: linear-gradient(135deg, var(--primary-color, #22C55E) 0%, var(--primary-hover, #16A34A) 100%); /* 🎨 GRADIENT DINÂMICO */
          color: white;
          font-weight: 700;
          padding: 1.2rem 2rem;
          border-radius: 1rem;
          border: none;
          transition: all 0.3s ease;
          font-size: 1.2rem;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(var(--primary-color-rgb, 34, 197, 94), 0.3);
          letter-spacing: 0.5px;
        }

        .next-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(var(--primary-color-rgb, 34, 197, 94), 0.4);
          background: linear-gradient(135deg, var(--primary-hover, #16A34A) 0%, var(--primary-hover-dark, #15803D) 100%); /* 🎨 GRADIENT HOVER DINÂMICO */
        }

        .next-button:disabled {
          background: #9CA3AF;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        /* 🎨 ESTILOS ADICIONAIS PARA ACESSIBILIDADE */
        .card-option:focus {
          outline: 2px solid var(--primary-color, #FF9D00);
          outline-offset: 2px;
        }

        .next-button:focus {
          outline: 2px solid white;
          outline-offset: 2px;
        }

        /* ---------------------------------------------------- */
        /* === MEDIA QUERIES (PARA FORÇAR 3 COLUNAS EM TABLETS) === */
        /* ---------------------------------------------------- */
        
        /* Tablets Grandes */
        @media (max-width: 1024px) {
          .selection-grid {
            grid-template-columns: 1fr 1fr 1fr;
            gap: 1.25rem;
          }
          
          .card-option {
            min-height: 160px;
          }
        }

        /* Tablets Pequenos */
        @media (max-width: 768px) {
          .selection-grid {
            grid-template-columns: 1fr 1fr 1fr;
            gap: 0.75rem;
          }
          
          .title {
            font-size: 1.8rem;
          }
          
          .subtitle {
            font-size: 1rem;
          }
          
          .card-option {
            padding: 1.5rem 1rem;
            min-height: 140px;
            border-radius: 0.75rem;
          }
          
          .card-number {
            font-size: 1.2rem;
          }
        }

        /* Mobile (640px) */
        @media (max-width: 640px) {
          .selection-grid {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }
          
          .title {
            font-size: 1.6rem;
          }
          
          .card-option {
            min-height: 120px;
          }
        }
        
      `}</style>
    </>
  );
};

export default MenuSelecao;