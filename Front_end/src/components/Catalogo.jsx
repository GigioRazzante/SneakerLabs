import React from 'react';
import { useTheme } from '../context/ThemeContext.jsx'; // 🎨 NOVO IMPORT

// 1. ✅ IMPORTAÇÃO DAS IMAGENS DE ESTILO
import estiloCasual from '../assets/estiloCasual.png';
import estiloEsportivo from '../assets/estiloEsportivo.png';
import estiloSkate from '../assets/estiloSkate.png';

// 2. ✅ IMPORTAÇÃO DAS IMAGENS DE MATERIAL
import materialCouro from '../assets/materialCouro.png';
import materialTecido from '../assets/materialTecido.png';
import materialCamurca from '../assets/materialCamurca.png';

// 3. ✅ IMPORTAÇÃO DAS IMAGENS DE SOLADO
import soladoBorracha from '../assets/soladoBorracha.png';
import soladoEva from '../assets/soladoEva.png';
import soladoAir from '../assets/soladoAir.png';

// 4. 🚀 IMPORTAÇÃO DAS NOVAS IMAGENS DE DETALHES/CADARÇOS
import cadarcoNormal from '../assets/cadarcoNormal.png';
import cadarcoColorido from '../assets/cadarcoColorido.png';
import semCadarco from '../assets/semCadarco.png';

// Dados mockados para o Catálogo
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
        nome: "Cadarços", // 5. 🚀 Mudei a categoria para "Cadarços"
        itens: [
            // 5. 🚀 ATRIBUIÇÃO DAS IMAGENS DE CADARÇOS
            { id: 16, legenda: "Normal", imgSrc: cadarcoNormal }, 
            { id: 17, legenda: "Colorido", imgSrc: cadarcoColorido },    
            { id: 18, legenda: "Sem Cadarço", imgSrc: semCadarco }, 
        ]
    },
];

// Sub-componente para renderizar um Card
const CardCatalogo = ({ item }) => {
    const backgroundColor = item.corFundo || '#F5F5F5';
    const textColor = item.corTexto || '#000000';
    const borderColor = item.corBorda || 'transparent'; 
    
    const isColorCard = !!item.corFundo; // Se tem corFundo, é um card de Cor.
    const hasImage = !!item.imgSrc; // Se tem imgSrc, é um card que usa imagem.

    // Extrai apenas o nome (para cores) ou usa a legenda completa (para outros)
    const corApenas = item.legenda.includes('–') 
        ? item.legenda.split('–')[0].trim() 
        : item.legenda;

    return (
        <div 
            className="catalogo-card" 
            style={{ 
                backgroundColor: isColorCard ? backgroundColor : '#FFFFFF', 
                border: `1px solid ${borderColor}` 
            }}
        >
            
            {/* Lógica de Renderização de Ícone / Imagem */}
            {!isColorCard && (
                <div 
                    className="card-img-placeholder" 
                    style={{ 
                        // Cor de fundo do placeholder: transparente se tiver imagem, cinza se for fallback.
                        backgroundColor: hasImage ? 'transparent' : '#A6A6A6',
                        border: 'none', 
                    }}
                >
                    {/* Renderiza a imagem real OU o placeholder de ícone */}
                    {hasImage ? (
                        <img 
                            src={item.imgSrc} 
                            alt={`Imagem do detalhe ${item.legenda}`} 
                            style={{ 
                                width: '100%', 
                                height: '100%', 
                                // O objectFit: 'cover' está definido no CSS global da PaginaCatalogo
                                objectFit: 'cover', 
                                borderRadius: '0.5rem'
                            }}
                        />
                    ) : (
                        /* Ícone simples para as outras seções (que não possuem imagem) */
                        <i 
                            className="fa-solid fa-shoe-prints" 
                            style={{ color: '#FFFFFF' }}
                        ></i>
                    )}
                </div>
            )}
            
            <p className="card-legenda" style={{ color: textColor }}>
                {corApenas}
            </p>
        </div>
    );
};

// Componente principal Catalogo
const Catalogo = () => {
    const { primaryColor } = useTheme(); // 🎨 HOOK DO TEMA

    return (
        <>
            <style>{`
                .catalogo-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 2rem;
                }
                
                .catalogo-titulo {
                    text-align: center;
                    font-size: 3rem;
                    font-weight: bold;
                    color: var(--primary-color); /* 🎨 COR DO TEMA */
                    margin-bottom: 3rem;
                }
                
                .catalogo-secao {
                    margin-bottom: 4rem;
                }
                
                .secao-titulo {
                    font-size: 2rem;
                    font-weight: bold;
                    color: var(--primary-color); /* 🎨 COR DO TEMA */
                    margin-bottom: 1.5rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 3px solid var(--primary-color); /* 🎨 COR DO TEMA */
                }
                
                .catalogo-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1.5rem;
                }
                
                .catalogo-card {
                    border-radius: 1rem;
                    padding: 1.5rem;
                    text-align: center;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                    cursor: pointer;
                    border: 2px solid transparent;
                }
                
                .catalogo-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
                    border-color: var(--primary-color); /* 🎨 COR DO TEMA */
                }
                
                .card-img-placeholder {
                    width: 100px;
                    height: 100px;
                    border-radius: 0.5rem;
                    margin: 0 auto 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                }
                
                .catalogo-card:hover .card-img-placeholder {
                    transform: scale(1.05);
                }
                
                .card-legenda {
                    font-weight: 600;
                    font-size: 1.1rem;
                    margin: 0;
                }
                
                .catalogo-footer-text {
                    text-align: center;
                    font-size: 1.2rem;
                    color: #555;
                    margin-top: 4rem;
                    padding-top: 2rem;
                    border-top: 2px dashed var(--primary-color); /* 🎨 COR DO TEMA */
                }
                
                .catalogo-footer-text span {
                    color: var(--primary-color); /* 🎨 COR DO TEMA */
                    font-weight: bold;
                }
                
                @media (max-width: 768px) {
                    .catalogo-content {
                        padding: 1rem;
                    }
                    
                    .catalogo-titulo {
                        font-size: 2.2rem;
                        margin-bottom: 2rem;
                    }
                    
                    .secao-titulo {
                        font-size: 1.6rem;
                    }
                    
                    .catalogo-grid {
                        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                        gap: 1rem;
                    }
                    
                    .catalogo-card {
                        padding: 1rem;
                    }
                    
                    .card-img-placeholder {
                        width: 80px;
                        height: 80px;
                    }
                    
                    .card-legenda {
                        font-size: 1rem;
                    }
                    
                    .catalogo-footer-text {
                        font-size: 1.1rem;
                        margin-top: 3rem;
                    }
                }
                
                @media (max-width: 480px) {
                    .catalogo-titulo {
                        font-size: 1.8rem;
                    }
                    
                    .secao-titulo {
                        font-size: 1.4rem;
                    }
                    
                    .catalogo-grid {
                        grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
                    }
                    
                    .catalogo-card {
                        padding: 0.8rem;
                    }
                    
                    .card-img-placeholder {
                        width: 70px;
                        height: 70px;
                    }
                    
                    .card-legenda {
                        font-size: 0.9rem;
                    }
                    
                    .catalogo-footer-text {
                        font-size: 1rem;
                    }
                }
            `}</style>

            <div className="catalogo-content">
                <h1 className="catalogo-titulo">Catálogo</h1>
                
                {categorias.map((categoria, index) => (
                    <section key={index} className="catalogo-secao">
                        <h2 className="secao-titulo">{categoria.nome}</h2>
                        <div className="catalogo-grid">
                            {categoria.itens.map(item => (
                                <CardCatalogo key={item.id} item={item} />
                            ))}
                        </div>
                    </section>
                ))}

                <p className="catalogo-footer-text">
                    Use este catálogo como inspiração para criar o seu Sneaker único no 
                    <span> Criador de Sneaker</span>!
                </p>
            </div>
        </>
    );
};

export default Catalogo;