import React from 'react';
import { useTheme } from '../context/ThemeContext.jsx';

// IMPORTAÇÕES DAS IMAGENS (mantidas as mesmas)
import estiloCasual from '../assets/estiloCasual.png';
import estiloEsportivo from '../assets/estiloEsportivo.png';
import estiloSkate from '../assets/estiloSkate.png';
import materialCouro from '../assets/materialCouro.png';
import materialTecido from '../assets/materialTecido.png';
import materialCamurca from '../assets/materialCamurca.png';
import soladoBorracha from '../assets/soladoBorracha.png';
import soladoEva from '../assets/soladoEva.png';
import soladoAir from '../assets/soladoAir.png';
import cadarcoNormal from '../assets/cadarcoNormal.png';
import cadarcoColorido from '../assets/cadarcoColorido.png';
import semCadarco from '../assets/semCadarco.png';

// Dados mockados (mantidos os mesmos)
const categorias = [
    {
        nome: "Estilos",
        itens: [
            { id: 1, legenda: "Casual", imgSrc: estiloCasual }, 
            { id: 2, legenda: "Esportivo", imgSrc: estiloEsportivo },
            { id: 3, legenda: "Skate", imgSrc: estiloSkate },
        ]
    },
    {
        nome: "Materiais",
        itens: [
            { id: 4, legenda: "Couro", imgSrc: materialCouro },
            { id: 5, legenda: "Tecido", imgSrc: materialTecido }, 
            { id: 6, legenda: "Camurça", imgSrc: materialCamurca }, 
        ]
    },
    {
        nome: "Solado",
        itens: [
            { id: 7, legenda: "Borracha", imgSrc: soladoBorracha },
            { id: 8, legenda: "EVA", imgSrc: soladoEva },
            { id: 9, legenda: "Air", imgSrc: soladoAir },
        ]
    },
    {
        nome: "Cores",
        itens: [
            { id: 10, legenda: "Branco – + R$ 20\nLimpo, versátil e minimalista", corFundo: '#FFFFFF', corBorda: '#A6A6A6' },
            { id: 11, legenda: "Preto – + R$ 30\nSofisticado e fácil de combinar", corFundo: '#000000', corTexto: '#FFFFFF' },
            { id: 12, legenda: "Azul – + R$ 25\nEstilo com um toque de personalidade", corFundo: '#007BFF', corTexto: '#FFFFFF' },
            { id: 13, legenda: "Vermelho – + R$ 28\nChamativo e cheio de atitude", corFundo: '#DC3545', corTexto: '#FFFFFF' },
            { id: 14, legenda: "Verde – + R$ 23\nFresco e moderno", corFundo: '#28A745', corTexto: '#FFFFFF' },
            { id: 15, legenda: "Amarelo – + R$ 30\nVibrante e ousado", corFundo: '#FFC107', corTexto: '#000000' },
        ]
    },
    {
        nome: "Cadarços",
        itens: [
            { id: 16, legenda: "Normal", imgSrc: cadarcoNormal }, 
            { id: 17, legenda: "Colorido", imgSrc: cadarcoColorido },    
            { id: 18, legenda: "Sem Cadarço", imgSrc: semCadarco }, 
        ]
    },
];

// Sub-componente CardCatalogo (melhorado)
const CardCatalogo = ({ item }) => {
    const { primaryColor } = useTheme();
    const backgroundColor = item.corFundo || '#FFFFFF';
    const textColor = item.corTexto || '#000000';
    const borderColor = item.corBorda || 'transparent';
    
    const isColorCard = !!item.corFundo;
    const hasImage = !!item.imgSrc;

    const corApenas = item.legenda.includes('–') 
        ? item.legenda.split('–')[0].trim() 
        : item.legenda;

    const descricao = item.legenda.includes('–') 
        ? item.legenda.split('–')[1]?.trim()
        : null;

    return (
        <div 
            className="catalogo-card" 
            style={{ 
                backgroundColor: isColorCard ? backgroundColor : '#FFFFFF', 
                border: `2px solid ${isColorCard ? borderColor : '#f0f0f0'}` 
            }}
        >
            {/* Container da Imagem/Cor */}
            <div className="card-visual">
                {!isColorCard && (
                    <div className="card-img-container">
                        {hasImage ? (
                            <img 
                                src={item.imgSrc} 
                                alt={`Imagem do detalhe ${item.legenda}`}
                                className="card-image"
                            />
                        ) : (
                            <div className="card-icon-placeholder">
                                <i className="fa-solid fa-shoe-prints"></i>
                            </div>
                        )}
                    </div>
                )}
                
                {isColorCard && (
                    <div 
                        className="color-swatch"
                        style={{ backgroundColor: backgroundColor }}
                    ></div>
                )}
            </div>

            {/* Informações do Card */}
            <div className="card-info">
                <h3 className="card-title" style={{ color: textColor }}>
                    {corApenas}
                </h3>
                {descricao && (
                    <p className="card-description">
                        {descricao}
                    </p>
                )}
            </div>

            {/* Badge de Hover */}
            <div className="card-hover-indicator" style={{ backgroundColor: primaryColor }}></div>
        </div>
    );
};

// Componente principal Catalogo (completo e responsivo)
const Catalogo = () => {
    const { primaryColor } = useTheme();

    return (
        <>
            <style>{`
                .catalogo-content {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 2rem 1.5rem;
                }
                
                /* Header do Catálogo */
                .catalogo-header {
                    text-align: center;
                    margin-bottom: 4rem;
                    position: relative;
                }
                
                .catalogo-titulo {
                    font-size: 3.5rem;
                    font-weight: 800;
                    color: var(--primary-color);
                    margin-bottom: 1rem;
                    background: linear-gradient(135deg, var(--primary-color) 0%, #ffb347 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                
                .catalogo-subtitulo {
                    font-size: 1.2rem;
                    color: #666;
                    max-width: 600px;
                    margin: 0 auto;
                    line-height: 1.6;
                }
                
                /* Seções */
                .catalogo-secao {
                    margin-bottom: 5rem;
                    position: relative;
                }
                
                .secao-header {
                    display: flex;
                    align-items: center;
                    margin-bottom: 2.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 2px solid #f0f0f0;
                }
                
                .secao-titulo {
                    font-size: 2.2rem;
                    font-weight: 700;
                    color: var(--primary-color);
                    margin: 0;
                    position: relative;
                    padding-left: 1.5rem;
                }
                
                .secao-titulo::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 8px;
                    height: 30px;
                    background: var(--primary-color);
                    border-radius: 4px;
                }
                
                .secao-count {
                    background: var(--primary-color);
                    color: white;
                    padding: 0.3rem 0.8rem;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    margin-left: 1rem;
                }
                
                /* Grid Responsivo Inteligente */
                .catalogo-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 2rem;
                    align-items: stretch;
                }
                
                /* Cards Melhorados */
                .catalogo-card {
                    background: white;
                    border-radius: 1.5rem;
                    padding: 2rem 1.5rem;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                    position: relative;
                    overflow: hidden;
                    border: 2px solid #f8f9fa;
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }
                
                .catalogo-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
                    border-color: var(--primary-color);
                }
                
                .card-visual {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    flex: 1;
                }
                
                .card-img-container {
                    width: 120px;
                    height: 120px;
                    border-radius: 1rem;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f8f9fa;
                }
                
                .card-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.3s ease;
                }
                
                .catalogo-card:hover .card-image {
                    transform: scale(1.1);
                }
                
                .card-icon-placeholder {
                    width: 80px;
                    height: 80px;
                    background: var(--primary-color);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .card-icon-placeholder i {
                    font-size: 2.5rem;
                    color: white;
                }
                
                .color-swatch {
                    width: 100px;
                    height: 100px;
                    border-radius: 1rem;
                    border: 3px solid #f0f0f0;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                }
                
                .catalogo-card:hover .color-swatch {
                    transform: scale(1.1);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
                }
                
                .card-info {
                    text-align: center;
                    flex-shrink: 0;
                }
                
                .card-title {
                    font-size: 1.4rem;
                    font-weight: 700;
                    margin: 0 0 0.5rem 0;
                    color: #333;
                }
                
                .card-description {
                    font-size: 0.9rem;
                    color: #666;
                    line-height: 1.5;
                    margin: 0;
                }
                
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
                
                .catalogo-card:hover .card-hover-indicator {
                    transform: scaleX(1);
                }
                
                /* Footer do Catálogo */
                .catalogo-footer {
                    text-align: center;
                    margin-top: 6rem;
                    padding-top: 3rem;
                    border-top: 2px dashed var(--primary-color);
                    position: relative;
                }
                
                .catalogo-footer-text {
                    font-size: 1.3rem;
                    color: #555;
                    line-height: 1.6;
                    max-width: 600px;
                    margin: 0 auto;
                }
                
                .catalogo-footer-text span {
                    color: var(--primary-color);
                    font-weight: 700;
                    position: relative;
                }
                
                .catalogo-footer-text span::after {
                    content: '';
                    position: absolute;
                    bottom: -2px;
                    left: 0;
                    width: 100%;
                    height: 2px;
                    background: var(--primary-color);
                    opacity: 0.3;
                }
                
                /* 🔥 RESPONSIVIDADE AVANÇADA */
                
                /* Tablets Grandes */
                @media (max-width: 1200px) {
                    .catalogo-grid {
                        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                        gap: 1.5rem;
                    }
                    
                    .catalogo-titulo {
                        font-size: 3rem;
                    }
                }
                
                /* Tablets */
                @media (max-width: 968px) {
                    .catalogo-content {
                        padding: 1.5rem 1rem;
                    }
                    
                    .catalogo-titulo {
                        font-size: 2.5rem;
                    }
                    
                    .secao-titulo {
                        font-size: 1.8rem;
                    }
                    
                    .catalogo-grid {
                        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                        gap: 1.5rem;
                    }
                    
                    .catalogo-card {
                        padding: 1.5rem 1rem;
                    }
                    
                    .card-img-container {
                        width: 100px;
                        height: 100px;
                    }
                    
                    .color-swatch {
                        width: 80px;
                        height: 80px;
                    }
                }
                
                /* Tablets Pequenos e Mobile Grande */
                @media (max-width: 768px) {
                    .catalogo-header {
                        margin-bottom: 3rem;
                    }
                    
                    .catalogo-titulo {
                        font-size: 2.2rem;
                    }
                    
                    .catalogo-subtitulo {
                        font-size: 1.1rem;
                        padding: 0 1rem;
                    }
                    
                    .secao-header {
                        margin-bottom: 2rem;
                    }
                    
                    .secao-titulo {
                        font-size: 1.6rem;
                    }
                    
                    .catalogo-grid {
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 1.2rem;
                    }
                    
                    .catalogo-secao {
                        margin-bottom: 3.5rem;
                    }
                }
                
                /* Mobile Médio */
                @media (max-width: 640px) {
                    .catalogo-grid {
                        grid-template-columns: 1fr 1fr;
                        gap: 1rem;
                    }
                    
                    .catalogo-card {
                        padding: 1.2rem 0.8rem;
                        border-radius: 1rem;
                    }
                    
                    .card-img-container {
                        width: 80px;
                        height: 80px;
                    }
                    
                    .color-swatch {
                        width: 70px;
                        height: 70px;
                    }
                    
                    .card-title {
                        font-size: 1.2rem;
                    }
                    
                    .card-description {
                        font-size: 0.8rem;
                    }
                }
                
                /* Mobile Pequeno */
                @media (max-width: 480px) {
                    .catalogo-content {
                        padding: 1rem 0.5rem;
                    }
                    
                    .catalogo-titulo {
                        font-size: 1.8rem;
                    }
                    
                    .catalogo-subtitulo {
                        font-size: 1rem;
                    }
                    
                    .secao-titulo {
                        font-size: 1.4rem;
                        padding-left: 1rem;
                    }
                    
                    .secao-titulo::before {
                        width: 6px;
                        height: 25px;
                    }
                    
                    .catalogo-grid {
                        grid-template-columns: 1fr;
                        gap: 1rem;
                    }
                    
                    .catalogo-card {
                        padding: 1.5rem 1rem;
                    }
                    
                    .card-img-container {
                        width: 100px;
                        height: 100px;
                    }
                    
                    .color-swatch {
                        width: 80px;
                        height: 80px;
                    }
                    
                    .catalogo-footer-text {
                        font-size: 1.1rem;
                    }
                }
                
                /* Mobile Muito Pequeno */
                @media (max-width: 360px) {
                    .catalogo-titulo {
                        font-size: 1.6rem;
                    }
                    
                    .secao-titulo {
                        font-size: 1.3rem;
                    }
                    
                    .catalogo-card {
                        padding: 1rem 0.8rem;
                    }
                    
                    .card-title {
                        font-size: 1.1rem;
                    }
                }
            `}</style>

            <div className="catalogo-content">
                {/* Header Melhorado */}
                <header className="catalogo-header">
                    <h1 className="catalogo-titulo">Catálogo SneakLab</h1>
                    <p className="catalogo-subtitulo">
                        Explore nossa coleção completa de estilos, materiais e cores para criar o sneaker perfeito
                    </p>
                </header>

                {/* Seções do Catálogo */}
                {categorias.map((categoria, index) => (
                    <section key={index} className="catalogo-secao">
                        <div className="secao-header">
                            <h2 className="secao-titulo">{categoria.nome}</h2>
                            <span className="secao-count">{categoria.itens.length} itens</span>
                        </div>
                        <div className="catalogo-grid">
                            {categoria.itens.map(item => (
                                <CardCatalogo key={item.id} item={item} />
                            ))}
                        </div>
                    </section>
                ))}

                {/* Footer Melhorado */}
                <footer className="catalogo-footer">
                    <p className="catalogo-footer-text">
                        Inspire-se com nosso catálogo e crie o sneaker dos seus sonhos no 
                        <span> Criador de Sneaker</span>!
                    </p>
                </footer>
            </div>
        </>
    );
};

export default Catalogo;