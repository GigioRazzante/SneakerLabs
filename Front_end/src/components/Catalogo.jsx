// src/components/Catalogo.jsx

import React from 'react';

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
    return (
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
                <span style={{ color: '#FF9D00', fontWeight: 'bold' }}> Criador de Sneaker</span>!
            </p>
        </div>
    );
};

export default Catalogo;