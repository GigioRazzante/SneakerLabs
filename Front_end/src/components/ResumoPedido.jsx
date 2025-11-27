import React from 'react';
import { useTheme } from '../context/ThemeContext.jsx';

const ResumoPedido = ({ selections, passos, onFinalize }) => {
    const { primaryColor } = useTheme();
    
    // Cálculo do valor total e criação dos itens
    let total = 0;
    const items = Object.keys(selections).map(stepId => {
        const stepIndex = parseInt(stepId, 10);
        const selectedOptionId = selections[stepIndex].id;
        const selectedOption = passos[stepIndex].opcoes.find(opt => opt.id === selectedOptionId);
        
        if (selectedOption) {
            total += selectedOption.acrescimo;
            return {
                step: stepIndex + 1,
                title: passos[stepIndex].titulo.split(':')[1]?.trim() || passos[stepIndex].titulo,
                category: passos[stepIndex].titulo.split(':')[0]?.trim(),
                name: selectedOption.nome,
                price: selectedOption.preco,
                acrescimo: selectedOption.acrescimo
            };
        }
        return null;
    }).filter(item => item !== null);

    // Ordenar os itens pelo passo
    items.sort((a, b) => a.step - b.step);

    const handleFinalizar = () => {
        const pedidoData = {
            items: items,
            valorTotal: total
        };
        
        console.log('📤 [ResumoPedido] Enviando dados para finalização:', pedidoData);
        onFinalize(pedidoData);
    };

    return (
        <>
            <style>{`
                .resumo-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 1.5rem;
                }
                
                /* Header do Resumo - Igual ao Catálogo */
                .resumo-header {
                    text-align: center;
                    margin-bottom: 4rem;
                    position: relative;
                }
                
                .resumo-titulo {
                    font-size: 3.5rem;
                    font-weight: 800;
                    color: var(--primary-color);
                    margin-bottom: 1rem;
                    background: linear-gradient(135deg, var(--primary-color) 0%, #ffb347 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                
                .resumo-subtitulo {
                    font-size: 1.2rem;
                    color: #666;
                    max-width: 600px;
                    margin: 0 auto;
                    line-height: 1.6;
                }
                
                /* Seções do Resumo - Estilo Catálogo */
                .resumo-secao {
                    margin-bottom: 4rem;
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
                
                /* Grid de Itens - Estilo Catálogo */
                .resumo-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 2rem;
                    align-items: stretch;
                }
                
                /* Cards do Resumo - Estilo Catálogo */
                .resumo-card {
                    background: white;
                    border-radius: 1.5rem;
                    padding: 2rem 1.5rem;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                    border: 2px solid #f8f9fa;
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }
                
                .resumo-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
                    border-color: var(--primary-color);
                }
                
                .resumo-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 2px solid #f0f0f0;
                }
                
                .resumo-step {
                    font-weight: 700;
                    color: var(--primary-color);
                    font-size: 1rem;
                    background: rgba(var(--primary-color-rgb), 0.1);
                    padding: 0.4rem 0.8rem;
                    border-radius: 2rem;
                }
                
                .resumo-category {
                    font-weight: 700;
                    color: #000000;
                    font-size: 1.2rem;
                }
                
                .resumo-details {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    flex: 1;
                }
                
                .resumo-detail-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.8rem 0;
                }
                
                .resumo-label {
                    font-weight: 600;
                    color: #666;
                    font-size: 1rem;
                }
                
                .resumo-value {
                    font-weight: 700;
                    color: #000000;
                    font-size: 1.1rem;
                }
                
                .resumo-price {
                    font-weight: 700;
                    color: var(--primary-color);
                    background: rgba(var(--primary-color-rgb), 0.1);
                    padding: 0.5rem 1rem;
                    border-radius: 2rem;
                    font-size: 1rem;
                }
                
                /* Total - Estilo Catálogo */
                .resumo-total {
                    background: white;
                    border: 2px solid var(--primary-color);
                    border-radius: 1.5rem;
                    padding: 2rem 1.5rem;
                    margin-top: 3rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-weight: 700;
                    font-size: 1.4rem;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                    transition: all 0.3s ease;
                }
                
                .resumo-total:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
                }
                
                .total-label {
                    color: #000000;
                }
                
                .total-value {
                    color: var(--primary-color);
                    background: linear-gradient(135deg, var(--primary-color) 0%, #ffb347 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    padding: 0.5rem 1rem;
                    border-radius: 1rem;
                    border: 2px solid rgba(var(--primary-color-rgb), 0.2);
                }
                
                /* Botão - Estilo Catálogo */
                .resumo-actions {
                    display: flex;
                    justify-content: center;
                    margin-top: 4rem;
                    padding-top: 3rem;
                    border-top: 2px dashed var(--primary-color);
                }
                
                .resumo-button {
                    width: 100%;
                    max-width: 400px;
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
                
                .resumo-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(var(--primary-color-rgb), 0.4);
                    opacity: 0.95;
                }
                
                /* Indicador de Hover - Igual ao Catálogo */
                .resumo-card::after,
                .resumo-total::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 4px;
                    background: var(--primary-color);
                    transform: scaleX(0);
                    transition: transform 0.3s ease;
                    border-radius: 0 0 1.5rem 1.5rem;
                }
                
                .resumo-card:hover::after,
                .resumo-total:hover::after {
                    transform: scaleX(1);
                }

                /* 🔥 RESPONSIVIDADE IGUAL AO CATÁLOGO */
                
                /* Tablets Grandes */
                @media (max-width: 1200px) {
                    .resumo-grid {
                        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                        gap: 1.5rem;
                    }
                    
                    .resumo-titulo {
                        font-size: 3rem;
                    }
                }
                
                /* Tablets */
                @media (max-width: 968px) {
                    .resumo-content {
                        padding: 0 1rem;
                    }
                    
                    .resumo-titulo {
                        font-size: 2.5rem;
                    }
                    
                    .secao-titulo {
                        font-size: 1.8rem;
                    }
                    
                    .resumo-grid {
                        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                        gap: 1.5rem;
                    }
                    
                    .resumo-card {
                        padding: 1.5rem 1rem;
                    }
                }
                
                /* Tablets Pequenos e Mobile Grande */
                @media (max-width: 768px) {
                    .resumo-header {
                        margin-bottom: 3rem;
                    }
                    
                    .resumo-titulo {
                        font-size: 2.2rem;
                    }
                    
                    .resumo-subtitulo {
                        font-size: 1.1rem;
                        padding: 0 1rem;
                    }
                    
                    .secao-header {
                        margin-bottom: 2rem;
                    }
                    
                    .secao-titulo {
                        font-size: 1.6rem;
                    }
                    
                    .resumo-grid {
                        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                        gap: 1.2rem;
                    }
                    
                    .resumo-secao {
                        margin-bottom: 3.5rem;
                    }
                    
                    .resumo-card-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.8rem;
                    }
                    
                    .resumo-total {
                        flex-direction: column;
                        gap: 1rem;
                        text-align: center;
                    }
                }
                
                /* Mobile Médio */
                @media (max-width: 640px) {
                    .resumo-grid {
                        grid-template-columns: 1fr;
                        gap: 1rem;
                    }
                    
                    .resumo-card {
                        padding: 1.5rem 1rem;
                        border-radius: 1rem;
                    }
                    
                    .resumo-titulo {
                        font-size: 1.8rem;
                    }
                    
                    .secao-titulo {
                        font-size: 1.4rem;
                        padding-left: 1rem;
                    }
                    
                    .secao-titulo::before {
                        width: 6px;
                        height: 25px;
                    }
                }
                
                /* Mobile Pequeno */
                @media (max-width: 480px) {
                    .resumo-content {
                        padding: 0 0.5rem;
                    }
                    
                    .resumo-titulo {
                        font-size: 1.6rem;
                    }
                    
                    .resumo-subtitulo {
                        font-size: 1rem;
                    }
                    
                    .secao-titulo {
                        font-size: 1.3rem;
                    }
                    
                    .resumo-card {
                        padding: 1.2rem 0.8rem;
                    }
                    
                    .resumo-button {
                        padding: 1rem 1.5rem;
                        font-size: 1.1rem;
                    }
                }
            `}</style>

            <div className="resumo-content">
                {/* REMOVIDO: card-header-bar - já é fornecido pela página principal */}
                
                {/* Header - Estilo Catálogo */}
                <header className="resumo-header">
                    <h1 className="resumo-titulo">Resumo do Pedido</h1>
                    <p className="resumo-subtitulo">
                        Revise suas escolhas cuidadosamente antes de enviar para produção
                    </p>
                </header>

                {/* Seção Principal - Estilo Catálogo */}
                <section className="resumo-secao">
                    <div className="secao-header">
                        <h2 className="secao-titulo">Suas Escolhas</h2>
                        <span className="secao-count">{items.length} itens</span>
                    </div>
                    
                    <div className="resumo-grid">
                        {items.map((item, index) => (
                            <div key={index} className="resumo-card">
                                <div className="resumo-card-header">
                                    <span className="resumo-step">Passo {item.step}</span>
                                    <span className="resumo-category">{item.category}</span>
                                </div>
                                
                                <div className="resumo-details">
                                    <div className="resumo-detail-row">
                                        <span className="resumo-label">Modelo:</span>
                                        <span className="resumo-value">{item.name}</span>
                                    </div>
                                    <div className="resumo-detail-row">
                                        <span className="resumo-label">Investimento:</span>
                                        <span className="resumo-price">{item.price}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Total - Estilo Catálogo */}
                <div className="resumo-total">
                    <span className="total-label">Valor Total do Sneaker:</span>
                    <span className="total-value">R$ {total.toFixed(2)}</span>
                </div>

                {/* Ações - Estilo Catálogo */}
                <div className="resumo-actions">
                    <button
                        className="resumo-button"
                        onClick={handleFinalizar}
                    >
                        🚀 Enviar para Produção
                    </button>
                </div>
            </div>
        </>
    );
};

export default ResumoPedido;