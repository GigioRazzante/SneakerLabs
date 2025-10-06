// src/components/Catalogo.jsx

import React from 'react';

// Dados mockados para o Catálogo (Sem alterações nos dados)
const categorias = [
    {
        nome: "Estilos",
        itens: [
            { id: 1, legenda: "Casual" },
            { id: 2, legenda: "Esportivo" },
            { id: 3, legenda: "Skate" },
        ]
    },
    {
        nome: "Materiais",
        itens: [
            { id: 4, legenda: "Couro" },
            { id: 5, legenda: "Lona" },
            { id: 6, legenda: "Sintético" },
        ]
    },
    {
        nome: "Solado",
        itens: [
            { id: 7, legenda: "Borracha" },
            { id: 8, legenda: "EVA" },
            { id: 9, legenda: "PU" },
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
        nome: "Detalhes",
        itens: [
            { id: 16, legenda: "Costura" }, 
            { id: 17, legenda: "Logo" },    
            { id: 18, legenda: "Etiqueta" }, 
        ]
    },
];

// Sub-componente para renderizar um Card
const CardCatalogo = ({ item }) => {
    const backgroundColor = item.corFundo || '#F5F5F5';
    const textColor = item.corTexto || '#000000';
    const borderColor = item.corBorda || 'transparent'; 
    
    // Identifica se é um card de Cor. 
    // É um card de cor se tiver a propriedade 'corFundo' definida.
    const isColorCard = !!item.corFundo; 

    // Usado apenas para definir a cor do ícone no caso de fundo claro (não-cores)
    const isLightBackground = backgroundColor === '#FFFFFF' || backgroundColor === '#F5F5F5' || backgroundColor === '#FFC107'; 

    // Extrai apenas o nome da cor (se houver o '–')
    const corApenas = item.legenda.includes('–') 
        ? item.legenda.split('–')[0].trim() 
        : item.legenda;

    return (
        <div 
            className="catalogo-card" 
            // Para cards de cor, o background será a cor
            style={{ 
                backgroundColor: isColorCard ? backgroundColor : '#FFFFFF', 
                border: `1px solid ${borderColor}` 
            }}
        >
            
            {/* ✅ MODIFICAÇÃO: Renderiza o placeholder APENAS se NÃO for um Card de Cor */}
            {!isColorCard && (
                <div 
                    className="card-img-placeholder" 
                    style={{ 
                        // O placeholder agora usa uma cor sólida para preencher o espaço da imagem
                        backgroundColor: '#A6A6A6',
                        border: 'none', 
                    }}
                >
                    {/* Ícone simples para representação */}
                    <i 
                        className="fa-solid fa-shoe-prints" 
                        style={{ color: '#FFFFFF' }} // Ícone branco contra o cinza do placeholder
                    ></i>
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
                            // Note que agora o CardCatalogo usa a cor do item se for cor, ou branco se for outra coisa.
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