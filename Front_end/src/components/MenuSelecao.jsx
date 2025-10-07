// src/components/MenuSelecao.jsx

import React from 'react';
// Importação das Imagens (Assumindo que estão em '../assets/' em relação a este componente)
// Certifique-se de que este caminho está correto no seu projeto!
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
    // O passoIndex pode ser usado para criar a chave única 'passoIndex-opcaoId'
    // Para obter o índice, podemos tentar buscar a partir do título do passo
    // Embora não seja a melhor prática, usaremos ele.
    // **No PaginaCriarSneaker.jsx, currentStep (índice 0 a 4) é passado para a seleção.**
    const passoIndex = passo.titulo.split(' ')[1].charAt(0) - 1; // "Passo 1 de 5..." -> 1 -> 0

    return (
        <div className="card-container">
            <div className="card-header-bar"></div>

            <div className="title-section">
                <h1 className="title">Criar meu Sneaker</h1>
                <p className="subtitle">{passo.titulo}</p>
            </div>

            <div className="selection-grid">
                {passo.opcoes.map((opcao, index) => {
                    const optionKey = `${passoIndex + 1}-${opcao.id}`; // Ex: '1-1', '2-3', etc.
                    const isColorStep = passoIndex === 3; // Passo 4 (índice 3) é a cor

                    // Define o estilo de fundo
                    const style = {};
                    if (isColorStep) {
                        // Se for o passo de cor, usa a cor do objeto 'opcao'
                        style.backgroundColor = opcao.background;
                    } else if (optionBackgrounds[optionKey]) {
                        // Se for outro passo, usa a imagem de fundo
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
                            {/* Adiciona um overlay para garantir a legibilidade do texto sobre a imagem */}
                            {!isColorStep && optionBackgrounds[optionKey] && (
                                <div className="image-overlay"></div>
                            )}
                            {/* Se for cor, adiciona uma borda sutil para melhor visualização do card de cor */}
                            {isColorStep && (
                                <div className="color-border"></div>
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
    );
};

export default MenuSelecao;