import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import ResumoPedidoItem from './ResumoPedidoItem';

const CarrinhoPedido = ({ pedidos, onConfirmarPedidos, onIncluirMaisPedidos }) => {
    const { primaryColor } = useTheme();
    const { user } = useAuth();
    const [generatedMessages, setGeneratedMessages] = useState({});
    const [loadingMessages, setLoadingMessages] = useState({});
    const [messagesGenerated, setMessagesGenerated] = useState(false);

    if (!pedidos || !Array.isArray(pedidos)) {
        return (
            <div className="carrinho-container">
                {/* REMOVIDO: card-header-bar - já é fornecido pela página principal */}
                <div className="title-section">
                    <h2 className="title">Erro no Carrinho</h2>
                    <p className="subtitle">Não foi possível carregar os pedidos.</p>
                </div>
            </div>
        );
    }

    const totalGeral = pedidos.reduce((total, pedido) => {
        if (!pedido) return total;
        
        const itemsValidos = pedido.items && Array.isArray(pedido.items);
        const valorPedido = pedido.valorTotal || 
                           (itemsValidos ? pedido.items.reduce((sum, item) => {
                               if (!item) return sum;
                               return sum + (item.acrescimo || 0);
                           }, 0) : 0);
        
        return total + valorPedido;
    }, 0);

    const extractSneakerConfig = (items) => {
        const config = {
            estilo: '',
            material: '',
            solado: '', 
            cor: '',
            detalhes: ''
        };
        
        items.forEach(item => {
            if (item && item.step && item.name) {
                if (item.step === 1) config.estilo = item.name;
                if (item.step === 2) config.material = item.name;
                if (item.step === 3) config.solado = item.name;
                if (item.step === 4) config.cor = item.name;
                if (item.step === 5) config.detalhes = item.name;
            }
        });
        
        return config;
    };

    const generateSneakerMessage = async (pedidoIndex, sneakerConfig) => {
        const messageKey = `${pedidoIndex}`;
        
        if (loadingMessages[messageKey] || generatedMessages[messageKey]) {
            return;
        }
        
        setLoadingMessages(prev => ({ ...prev, [messageKey]: true }));
        
        try {
            const response = await fetch('http://localhost:3001/api/mensagens/gerar-mensagem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pedidoId: `temp-${Date.now()}-${pedidoIndex}`,
                    produtoIndex: pedidoIndex,
                    sneakerConfig: sneakerConfig,
                    nomeUsuario: user?.nome_usuario || 'Cliente'
                })
            });

            if (response.ok) {
                const data = await response.json();
                
                if (data.sucesso && data.mensagem) {
                    setGeneratedMessages(prev => ({
                        ...prev,
                        [messageKey]: data.mensagem
                    }));
                } else {
                    const fallbackMessage = createFallbackMessage(sneakerConfig, user?.nome_usuario || 'Cliente');
                    setGeneratedMessages(prev => ({
                        ...prev,
                        [messageKey]: fallbackMessage
                    }));
                }
            } else {
                throw new Error('Falha na requisição');
            }
        } catch (error) {
            const fallbackMessage = createFallbackMessage(sneakerConfig, user?.nome_usuario || 'Cliente');
            setGeneratedMessages(prev => ({
                ...prev,
                [messageKey]: fallbackMessage
            }));
        } finally {
            setLoadingMessages(prev => ({ ...prev, [messageKey]: false }));
        }
    };

    const createFallbackMessage = (sneakerConfig, nomeUsuario) => {
        const { estilo, material, cor, solado, detalhes } = sneakerConfig;
        
        return `Excelente, ${nomeUsuario}! 🎉

Seu sneaker ${estilo} em ${material} na cor ${cor}, com solado ${solado} e ${detalhes} ficou incrível!

Pedido confirmado e em breve estará em produção. Obrigado por criar conosco no SneakLab! 👟✨`;
    };

    useEffect(() => {
        if (pedidos.length > 0 && !messagesGenerated) {
            pedidos.forEach((pedido, pedidoIndex) => {
                if (pedido.items && Array.isArray(pedido.items)) {
                    const sneakerConfig = extractSneakerConfig(pedido.items);
                    const messageKey = `${pedidoIndex}`;
                    
                    if (!generatedMessages[messageKey] && !loadingMessages[messageKey]) {
                        setTimeout(() => {
                            generateSneakerMessage(pedidoIndex, sneakerConfig);
                        }, pedidoIndex * 1000);
                    }
                }
            });
            
            setMessagesGenerated(true);
        }
    }, [pedidos, messagesGenerated]);

    useEffect(() => {
        setMessagesGenerated(false);
        setGeneratedMessages({});
        setLoadingMessages({});
    }, [pedidos.length]);

    const handleConfirmarPedidos = async () => {
        try {
            const pedidoCriado = await onConfirmarPedidos();
            
            if (!pedidoCriado || !pedidoCriado.id) {
                alert('Erro: Não foi possível obter o ID do pedido.');
                return;
            }

            const pedidoIdReal = pedidoCriado.id;

            const saveMessagePromises = pedidos.map(async (pedido, pedidoIndex) => {
                if (pedido.items && Array.isArray(pedido.items)) {
                    const sneakerConfig = extractSneakerConfig(pedido.items);
                    
                    await fetch('http://localhost:3001/api/mensagens/salvar-no-pedido', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            pedidoId: pedidoIdReal,
                            produtoIndex: pedidoIndex,
                            sneakerConfig: sneakerConfig,
                            nomeUsuario: user?.nome_usuario || 'Cliente'
                        })
                    });
                }
            });

            await Promise.all(saveMessagePromises);

        } catch (error) {
            alert('Erro ao salvar mensagens dos sneakers. Tente novamente.');
        }
    };

    if (pedidos.length === 0) {
        return (
            <div className="carrinho-container">
                {/* REMOVIDO: card-header-bar - já é fornecido pela página principal */}
                <div className="title-section">
                    <h2 className="title">Carrinho Vazio</h2>
                    <p className="subtitle">Adicione sneakers personalizados ao carrinho</p>
                </div>
                <div className="carrinho-actions">
                    <button 
                        className="action-button"
                        onClick={onIncluirMaisPedidos}
                    >
                        ➕ Começar a Personalizar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <style>{`
                .carrinho-container {
                    width: 100%;
                }
                
                .title-section {
                    text-align: center;
                    margin: 0 0 1.5rem 0;
                }
                
                .title {
                    font-size: 2.2rem;
                    font-weight: 800;
                    color: var(--primary-color);
                    margin-bottom: 0.5rem;
                }
                
                .subtitle {
                    color: #666;
                    font-size: 1.1rem;
                }
                
                .pedidos-list {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }
                
                .pedido-item {
                    background: white;
                    border-radius: 1rem;
                    padding: 1.5rem;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    border: 2px solid #f8f9fa;
                }
                
                .pedido-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid #f0f0f0;
                }
                
                .pedido-title {
                    color: var(--primary-color);
                    margin: 0;
                    font-size: 1.3rem;
                    font-weight: 700;
                }
                
                .pedido-price {
                    color: var(--primary-color);
                    font-weight: 700;
                    background: rgba(var(--primary-color-rgb), 0.1);
                    padding: 0.4rem 0.8rem;
                    border-radius: 1rem;
                    font-size: 1rem;
                }
                
                .sneaker-message {
                    margin: 1rem 0;
                }
                
                .message-container {
                    background: rgba(var(--primary-color-rgb), 0.05);
                    border-radius: 1rem;
                    padding: 1.5rem;
                    border: 1px solid rgba(var(--primary-color-rgb), 0.2);
                    min-height: 150px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }
                
                .message-content {
                    max-width: 100%;
                    text-align: center;
                    line-height: 1.6;
                    color: #333;
                    font-size: 1rem;
                    white-space: pre-line;
                    font-weight: 500;
                }
                
                .loading-spinner {
                    display: inline-block;
                    width: 20px;
                    height: 20px;
                    border: 2px solid #f3f3f3;
                    border-top: 2px solid var(--primary-color);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                
                .loading-text {
                    margin-top: 10px;
                    color: #666;
                    text-align: center;
                    font-size: 0.9rem;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .total-geral {
                    background: white;
                    border: 2px solid var(--primary-color);
                    border-radius: 1rem;
                    padding: 1.5rem;
                    margin-top: 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-weight: 700;
                    font-size: 1.2rem;
                }
                
                .total-geral-label {
                    color: #000000;
                }
                
                .total-geral-value {
                    color: var(--primary-color);
                }
                
                .carrinho-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    width: 100%;
                    max-width: 350px;
                    margin: 2rem auto 0;
                }
                
                .action-button {
                    width: 100%;
                    background-color: var(--primary-color);
                    color: white;
                    font-weight: 700;
                    padding: 1rem 2rem;
                    border-radius: 1rem;
                    border: none;
                    transition: all 0.3s ease;
                    font-size: 1.1rem;
                    cursor: pointer;
                }
                
                .action-button:hover:not(:disabled) {
                    opacity: 0.9;
                    transform: translateY(-1px);
                }
                
                .action-button:disabled {
                    background: #9CA3AF;
                    cursor: not-allowed;
                    transform: none;
                }
                
                .action-button.secondary {
                    background: #6B7280;
                }
                
                .action-button.secondary:hover {
                    background: #5A6268;
                }
                
                /* === RESPONSIVIDADE === */
                
                @media (max-width: 768px) {
                    .title {
                        font-size: 1.8rem;
                    }
                    
                    .pedido-item {
                        padding: 1.2rem;
                    }
                    
                    .pedido-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.5rem;
                    }
                    
                    .message-container {
                        padding: 1.2rem;
                        min-height: 120px;
                    }
                    
                    .total-geral {
                        flex-direction: column;
                        gap: 0.5rem;
                        text-align: center;
                        padding: 1.2rem;
                    }
                    
                    .carrinho-actions {
                        max-width: 100%;
                    }
                }

                @media (max-width: 480px) {
                    .title {
                        font-size: 1.5rem;
                    }
                    
                    .pedido-item {
                        padding: 1rem;
                    }
                    
                    .pedido-title {
                        font-size: 1.1rem;
                    }
                    
                    .message-container {
                        padding: 1rem;
                    }
                    
                    .message-content {
                        font-size: 0.9rem;
                    }
                    
                    .action-button {
                        padding: 0.9rem 1.5rem;
                        font-size: 1rem;
                    }
                }
            `}</style>

            <div className="carrinho-container">
                {/* REMOVIDO: card-header-bar - já é fornecido pela página principal */}
                
                <div className="title-section">
                    <h2 className="title">Meu Carrinho</h2>
                    <p className="subtitle">{pedidos.length} sneaker(s) personalizado(s)</p>
                </div>

                <div className="pedidos-list">
                    {pedidos.map((pedido, pedidoIndex) => {
                        if (!pedido) return null;

                        const itemsValidos = pedido.items && Array.isArray(pedido.items);
                        const totalPedido = pedido.valorTotal || 
                                          (itemsValidos ? pedido.items.reduce((sum, item) => {
                                              if (!item) return sum;
                                              return sum + (item.acrescimo || 0);
                                          }, 0) : 0);

                        const messageKey = `${pedidoIndex}`;
                        const message = generatedMessages[messageKey];
                        const isLoading = loadingMessages[messageKey];

                        return (
                            <div key={pedido.id || pedidoIndex} className="pedido-item">
                                <div className="pedido-header">
                                    <h3 className="pedido-title">Sneaker #{pedidoIndex + 1}</h3>
                                    <span className="pedido-price">R$ {totalPedido.toFixed(2)}</span>
                                </div>
                                
                                <div className="sneaker-message">
                                    <div className="message-container">
                                        {isLoading ? (
                                            <div style={{textAlign: 'center'}}>
                                                <div className="loading-spinner"></div>
                                                <p className="loading-text">Gerando mensagem personalizada...</p>
                                            </div>
                                        ) : message ? (
                                            <div className="message-content">
                                                {message}
                                            </div>
                                        ) : (
                                            <div style={{textAlign: 'center'}}>
                                                <div className="loading-spinner"></div>
                                                <p className="loading-text">Preparando mensagem...</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {itemsValidos ? (
                                    <ResumoPedidoItem 
                                        pedido={pedido} 
                                        valorTotal={totalPedido} 
                                    />
                                ) : (
                                    <div style={{color: '#dc3545', textAlign: 'center', padding: '1rem'}}>
                                        <p>Erro: Itens do pedido não disponíveis</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="total-geral">
                    <span className="total-geral-label">Total do Pedido:</span>
                    <span className="total-geral-value">R$ {totalGeral.toFixed(2)}</span>
                </div>

                <div className="carrinho-actions">
                    <button 
                        className="action-button"
                        onClick={handleConfirmarPedidos}
                        disabled={pedidos.length === 0}
                    >
                        ✅ Confirmar {pedidos.length} Pedido(s) - R$ {totalGeral.toFixed(2)}
                    </button>
                    <button 
                        className="action-button secondary"
                        onClick={onIncluirMaisPedidos}
                    >
                        ➕ Incluir Mais um Sneaker
                    </button>
                </div>
            </div>
        </>
    );
};

export default CarrinhoPedido;