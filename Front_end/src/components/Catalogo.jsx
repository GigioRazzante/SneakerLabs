// src/components/Catalogo.jsx (ou onde quer que seus componentes estejam)
import React from 'react';

// Dados mockados para o Catálogo
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
            { id: 10, legenda: "Branco", corFundo: '#FFFFFF', corBorda: '#A6A6A6' },
            { id: 11, legenda: "Preto", corFundo: '#000000', corTexto: '#FFFFFF' },
            { id: 12, legenda: "Laranja", corFundo: '#FF9D00', corTexto: '#FFFFFF' },
        ]
    },
    {
        nome: "Detalhes",
        itens: [
            { id: 13, legenda: "Costura" },
            { id: 14, legenda: "Logo" },
            { id: 15, legenda: "Etiqueta" },
        ]
    },
];

// Sub-componente para renderizar um Card
const CardCatalogo = ({ item }) => {
    // Cores padrão, ajustadas para as categorias de Cores
    const backgroundColor = item.corFundo || '#F5F5F5';
    const textColor = item.corTexto || '#000000';
    const borderColor = item.corBorda || 'transparent'; 
    const isLightBackground = backgroundColor === '#FFFFFF' || backgroundColor === '#F5F5F5';

    return (
        <div className="catalogo-card" style={{ backgroundColor, border: `1px solid ${borderColor}` }}>
            <div 
                className="card-img-placeholder" 
                style={{ 
                    // Se for branco ou cinza claro, adiciona uma borda cinza para destacar a área da imagem.
                    border: isLightBackground ? '1px solid #A6A6A6' : 'none',
                    // Para os cartões de cor, o placeholder é a cor em si
                    backgroundColor: backgroundColor === '#F5F5F5' ? '#A6A6A6' : (item.corFundo || '#A6A6A6')
                }}
            >
                {/* Ícone simples para representação */}
                <i 
                    className="fa-solid fa-shoe-prints" 
                    style={{ color: isLightBackground ? '#000000' : '#FFFFFF' }}
                ></i>
            </div>
            <p className="card-legenda" style={{ color: textColor }}>
                {item.legenda}
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