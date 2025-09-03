import React, { useState } from 'react';
import bgImage from '../assets/sneakers-bg.png'; // ajuste o caminho conforme sua pasta

const PaginaCriarSneaker = () => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleSelectCard = (cardId) => {
    setSelectedCard(cardId);
    setSnackbarMessage(`Opção ${cardId} selecionada!`);
    setShowSnackbar(true);
    setTimeout(() => setShowSnackbar(false), 3000);
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
  overflow: hidden; /* remove scroll horizontal e vertical */
}

.main-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0; /* remove padding que pode gerar overflow */
}

.main-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url(/Front_end/src/assets/sneakers-bg.png);
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
          }

          .header {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            z-index: 10;
            background-color: white;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            padding: 1rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .card-container {
            background-color: white;
            border-radius: 1rem;
            box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 60rem;
            margin: 6rem auto 0 auto;
            padding: 1.5rem; /* 2rem lateral removido */
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

          @media (min-width: 768px) {
            .next-button {
              width: 33.3333%;
            }
          }

          .snackbar {
            position: fixed;
            top: 1rem;
            right: 1rem;
            background-color: #10B981;
            color: white;
            padding: 0.75rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 50;
          }
        `}
      </style>

      <div id="root">
        <div className="main-container">
          <div className="content">
            <div className="header">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: 'black', fontSize: '1.5rem', fontWeight: 'bold' }}>Sneak</span>
                <span style={{ color: '#FF9D00', fontSize: '1.5rem', fontWeight: 'bold' }}>Lab</span>
              </div>
            </div>
            
            <div className="card-container">
              <div className="card-header-bar"></div>

              <div className="title-section">
                <h1 className="title">Criar meu Sneaker</h1>
                <p className="subtitle">Passo 1 de 5: Escolha o seu estilo.</p>
              </div>

              <div className="selection-grid">
                <div
                  onClick={() => handleSelectCard(1)}
                  className={`card-option ${selectedCard === 1 ? 'selected' : ''}`}
                >
                  <span className="card-number">1</span>
                </div>
                <div
                  onClick={() => handleSelectCard(2)}
                  className={`card-option ${selectedCard === 2 ? 'selected' : ''}`}
                >
                  <span className="card-number">2</span>
                </div>
                <div
                  onClick={() => handleSelectCard(3)}
                  className={`card-option ${selectedCard === 3 ? 'selected' : ''}`}
                >
                  <span className="card-number">3</span>
                </div>
              </div>

              <div className="next-button-container">
                <button className="next-button">Próximo</button>
              </div>
            </div>
          </div>

          {showSnackbar && (
            <div className="snackbar">{snackbarMessage}</div>
          )}
        </div>
      </div>
    </>
  );
};

export default PaginaCriarSneaker;
