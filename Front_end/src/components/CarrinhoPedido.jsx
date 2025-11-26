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

    // Validar se pedidos existe e é um array
    if (!pedidos || !Array.isArray(pedidos)) {
        return (
            <div className="card-container">
                <div className="card-header-bar"></div>
                <div className="title-section">
                    <h2 className="title">Erro no Carrinho</h2>
                    <p className="subtitle">Não foi possível carregar os pedidos.</p>
                </div>
            </div>
        );
    }

    // Calcular total geral
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

    // Extrair configuração do sneaker
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

    // Gerar mensagem personalizada
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
                    // Fallback local
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
            // Fallback local em caso de erro
            const fallbackMessage = createFallbackMessage(sneakerConfig, user?.nome_usuario || 'Cliente');
            setGeneratedMessages(prev => ({
                ...prev,
                [messageKey]: fallbackMessage
            }));
        } finally {
            setLoadingMessages(prev => ({ ...prev, [messageKey]: false }));
        }
    };

    // Mensagem de fallback
    const createFallbackMessage = (sneakerConfig, nomeUsuario) => {
        const { estilo, material, cor, solado, detalhes } = sneakerConfig;
        
        return `Excelente, ${nomeUsuario}! 🎉

Seu sneaker ${estilo} em ${material} na cor ${cor}, com solado ${solado} e ${detalhes} ficou incrível!

Pedido confirmado e em breve estará em produção. Obrigado por criar conosco no SneakLab! 👟✨`;
    };

    // Effect para gerar mensagens
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

    // Effect para resetar quando pedidos mudarem
    useEffect(() => {
        setMessagesGenerated(false);
        setGeneratedMessages({});
        setLoadingMessages({});
    }, [pedidos.length]);

    // Confirmar pedidos
    const handleConfirmarPedidos = async () => {
        try {
            const pedidoCriado = await onConfirmarPedidos();
            
            if (!pedidoCriado || !pedidoCriado.id) {
                alert('Erro: Não foi possível obter o ID do pedido.');
                return;
            }

            const pedidoIdReal = pedidoCriado.id;

            // Salvar mensagens definitivas
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

    // Carrinho vazio
    if (pedidos.length === 0) {
        return (
            <div className="card-container">
                <div className="card-header-bar"></div>
                <div className="title-section">
                    <h2 className="title">Carrinho Vazio</h2>
                    <p className="subtitle">Adicione sneakers personalizados ao carrinho.</p>
                </div>
                <div className="cart-actions">
                    <button 
                        className="next-button"
                        onClick={onIncluirMaisPedidos}
                        style={{maxWidth: '300px'}}
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
                .card-container {
                    width: 100%;
                }
                
                .card-header-bar {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 1.5rem;
                    background-color: var(--primary-color);
                    border-top-left-radius: 1.5rem;
                    border-top-right-radius: 1.5rem;
                }
                
                .title-section {
                    text-align: center;
                    margin-top: 1.5rem;
                    margin-bottom: 2rem;
                }
                
                .title {
                    font-size: 2.2rem;
                    font-weight: bold;
                    color: var(--primary-color);
                }
                
                .subtitle {
                    color: #555;
                    margin-top: 0.5rem;
                    font-size: 1.1rem;
                }
                
                .cart-content {
                    width: 100%;
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
                    border: 2px solid var(--primary-color);
                }
                
                .pedido-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 2px solid var(--primary-color);
                }
                
                .pedido-title {
                    color: var(--primary-color);
                    margin: 0;
                    font-size: 1.3rem;
                }
                
                .pedido-date {
                    color: #666;
                    font-size: 0.9rem;
                }
                
                .sneaker-message {
                    text-align: center;
                    margin: 1rem 0;
                }
                
                .message-placeholder {
                    background: linear-gradient(135deg, var(--primary-light) 0%, #ffffff 100%);
                    border-radius: 0.75rem;
                    padding: 2rem;
                    border: 2px solid var(--primary-color);
                    min-height: 200px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                
                .message-content {
                    max-width: 100%;
                    text-align: center;
                    line-height: 1.6;
                    color: #333; /* COR FIXA - SEMPRE VISÍVEL */
                    font-size: 1.1rem;
                    white-space: pre-line;
                    font-weight: 500;
                }
                
                .message-highlight {
                    color: var(--primary-color);
                    font-weight: 600;
                }
                
                .loading-spinner {
                    display: inline-block;
                    width: 20px;
                    height: 20px;
                    border: 3px solid #f3f3f3;
                    border-top: 3px solid var(--primary-color);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                
                .loading-text {
                    margin-top: 10px;
                    color: #666;
                    text-align: center;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .pedido-divider {
                    border: none;
                    border-top: 2px dashed var(--primary-color);
                    margin: 2rem 0;
                }
                
                .total-geral {
                    background-color: var(--primary-light);
                    border: 2px solid var(--primary-color);
                    border-radius: 1rem;
                    padding: 1.5rem;
                    margin-top: 2rem;
                }
                
                .total-geral-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-weight: bold;
                    font-size: 1.3rem;
                }
                
                .total-geral-label {
                    color: #000000;
                }
                
                .total-geral-value {
                    color: var(--primary-color);
                }
                
                .cart-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    width: 100%;
                    max-width: 400px;
                    margin: 2rem auto 0;
                    align-items: center;
                }
                
                .confirm-button-container {
                    display: flex;
                    justify-content: center;
                    width: 100%;
                    margin-bottom: 1rem;
                }
                
                .next-button {
                    width: 100%;
                    max-width: 400px;
                    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
                    color: white;
                    font-weight: 600;
                    padding: 0.8rem;
                    border-radius: 9999px;
                    border: none;
                    transition: all 0.3s ease;
                    font-size: 1.1rem;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                }
                
                .next-button:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(0,0,0,0.3);
                }
                
                .next-button:disabled {
                    background: #ccc;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                }
                
                .add-more-button {
                    width: 100%;
                    max-width: 400px;
                    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
                    color: white;
                    font-weight: 600;
                    padding: 0.8rem;
                    border-radius: 9999px;
                    border: none;
                    transition: all 0.3s ease;
                    font-size: 1.1rem;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                }
                
                .add-more-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(0,0,0,0.3);
                }
                
                @media (max-width: 768px) {
                    .pedido-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.5rem;
                    }
                    
                    .pedido-item {
                        padding: 1rem;
                    }
                    
                    .total-geral {
                        padding: 1rem;
                    }
                    
                    .total-geral-content {
                        font-size: 1.1rem;
                        flex-direction: column;
                        gap: 0.5rem;
                        text-align: center;
                    }
                    
                    .title {
                        font-size: 1.8rem;
                    }
                    
                    .cart-actions {
                        max-width: 100%;
                    }
                    
                    .next-button,
                    .add-more-button {
                        max-width: 100%;
                        font-size: 1rem;
                        padding: 0.7rem;
                    }
                    
                    .message-content {
                        font-size: 1rem;
                        padding: 1rem;
                    }
                }
                
                @media (max-width: 480px) {
                    .title {
                        font-size: 1.5rem;
                    }
                    
                    .message-placeholder {
                        padding: 1.5rem 1rem;
                    }
                    
                    .next-button,
                    .add-more-button {
                        font-size: 0.95rem;
                        padding: 0.6rem;
                    }
                    
                    .message-content {
                        font-size: 0.9rem;
                    }
                }
            `}</style>

            <div className="card-container">
                <div className="card-header-bar"></div>
                
                <div className="title-section">
                    <h2 className="title">Meu Carrinho</h2>
                    <p className="subtitle">{pedidos.length} sneaker(s) personalizado(s) no carrinho</p>
                </div>

                <div className="cart-content">
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
                                        <span className="pedido-date">Valor: R$ {totalPedido.toFixed(2)}</span>
                                    </div>
                                    
                                    <div className="sneaker-message">
                                        <div className="message-placeholder">
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
                                        <div className="cart-summary">
                                            <h3 className="summary-title">Resumo do Pedido</h3>
                                            <p>Erro: Itens do pedido não disponíveis</p>
                                        </div>
                                    )}
                                    
                                    {pedidoIndex < pedidos.length - 1 && <hr className="pedido-divider" />}
                                </div>
                            );
                        })}
                    </div>

                    <div className="total-geral">
                        <div className="total-geral-content">
                            <span className="total-geral-label">Total do Pedido:</span>
                            <span className="total-geral-value">R$ {totalGeral.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="cart-actions">
                        <div className="confirm-button-container">
                            <button 
                                className="next-button"
                                onClick={handleConfirmarPedidos}
                                disabled={pedidos.length === 0}
                            >
                                ✅ Confirmar {pedidos.length} Pedido(s) - R$ {totalGeral.toFixed(2)}
                            </button>
                        </div>
                        <button 
                            className="add-more-button"
                            onClick={onIncluirMaisPedidos}
                        >
                            ➕ Incluir Mais um Sneaker
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CarrinhoPedido;