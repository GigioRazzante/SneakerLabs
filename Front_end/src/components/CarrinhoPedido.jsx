// src/components/CarrinhoPedido.jsx (CORRIGIDO)
import React, { useState, useEffect } from 'react';
import ResumoPedidoItem from './ResumoPedidoItem';

const CarrinhoPedido = ({ pedidos, onConfirmarPedidos, onIncluirMaisPedidos }) => {
    const [generatedImages, setGeneratedImages] = useState({});
    const [loadingImages, setLoadingImages] = useState({});
    const [imagesGenerated, setImagesGenerated] = useState(false);
    const [imageErrors, setImageErrors] = useState({});

    // 🚨 CORREÇÃO: Adicionar validação completa
    console.log('🔍 [CarrinhoPedido] Pedidos recebidos:', pedidos);
    
    // Validar se pedidos existe e é um array
    if (!pedidos || !Array.isArray(pedidos)) {
        console.error('❌ [CarrinhoPedido] Pedidos é undefined ou não é array:', pedidos);
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

    // 🚨 CORREÇÃO: Calcular o total com validação robusta
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

    // 🚨 FUNÇÃO PARA CRIAR FALLBACK SVG LOCAL
    const createLocalFallbackSVG = (sneakerConfig, pedidoIndex) => {
        const { cor = 'cinza', estilo = 'sneaker', material = 'couro', solado = 'padrão' } = sneakerConfig;
        
        const colors = {
            'preto': '2c3e50', 'branco': 'ecf0f1', 'vermelho': 'e74c3c',
            'azul': '3498db', 'verde': '2ecc71', 'amarelo': 'f1c40f',
            'rosa': 'e84393', 'cinza': '7f8c8d', 'laranja': 'e67e22',
            'marrom': '8b4513', 'roxo': '9b59b6', 'bege': 'f5f5dc'
        };
        
        const bgColor = colors[cor.toLowerCase()] || '7f8c8d';
        const textColor = ['preto', 'marrom', 'roxo'].includes(cor.toLowerCase()) ? 'ecf0f1' : '2c3e50';
        
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
                <rect width="300" height="200" fill="#${bgColor}"/>
                
                <!-- Tênis simplificado -->
                <ellipse cx="150" cy="100" rx="80" ry="40" fill="#34495e" opacity="0.9"/>
                <rect x="100" y="100" width="100" height="30" fill="#2c3e50" opacity="0.8"/>
                
                <!-- Ícone de tênis + texto -->
                <text x="150" y="80" font-family="Arial" font-size="20" fill="#${textColor}" text-anchor="middle">👟</text>
                <text x="150" y="110" font-family="Arial" font-size="12" fill="#${textColor}" text-anchor="middle" font-weight="bold">
                    ${estilo}
                </text>
                <text x="150" y="130" font-family="Arial" font-size="10" fill="#${textColor}" text-anchor="middle">
                    ${material} • ${cor}
                </text>
                <text x="150" y="150" font-family="Arial" font-size="10" fill="#${textColor}" text-anchor="middle">
                    Sneaker #${pedidoIndex + 1}
                </text>
            </svg>
        `;
        
        return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    };

    // 🚨 FUNÇÃO PARA EXTRAIR CONFIGURAÇÃO DO SNEAKER (ATUALIZADA)
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
        
        console.log('🔧 Configuração extraída:', config);
        return config;
    };

    // 🚨 FUNÇÃO PARA GERAR IMAGEM (AGORA DEFINIDA ANTES DO useEffect)
    const generateSneakerImage = async (pedidoIndex, sneakerConfig) => {
        const imageKey = `${pedidoIndex}`;
        
        // Verificar se já está carregando ou já tem imagem
        if (loadingImages[imageKey] || generatedImages[imageKey]) {
            return;
        }
        
        setLoadingImages(prev => ({ ...prev, [imageKey]: true }));
        setImageErrors(prev => ({ ...prev, [imageKey]: false }));
        
        try {
            console.log(`🔄 Iniciando geração de imagem para sneaker ${pedidoIndex + 1}`);
            
            const response = await fetch('http://localhost:3001/api/images/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pedidoId: `temp-${Date.now()}-${pedidoIndex}`,
                    produtoIndex: pedidoIndex,
                    sneakerConfig: sneakerConfig
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success && data.imageUrl) {
                setGeneratedImages(prev => ({
                    ...prev,
                    [imageKey]: data.imageUrl
                }));
                console.log(`✅ Imagem gerada para sneaker ${pedidoIndex + 1}`);
            } else {
                console.error(`❌ Falha ao gerar imagem para sneaker ${pedidoIndex + 1}:`, data);
                // Usar fallback local em caso de erro
                const fallbackImage = createLocalFallbackSVG(sneakerConfig, pedidoIndex);
                setGeneratedImages(prev => ({
                    ...prev,
                    [imageKey]: fallbackImage
                }));
            }
        } catch (error) {
            console.error(`Erro ao gerar imagem para sneaker ${pedidoIndex + 1}:`, error);
            // Usar fallback local em caso de erro
            const fallbackImage = createLocalFallbackSVG(sneakerConfig, pedidoIndex);
            setGeneratedImages(prev => ({
                ...prev,
                [imageKey]: fallbackImage
            }));
        } finally {
            setLoadingImages(prev => ({ ...prev, [imageKey]: false }));
        }
    };

    // 🚨 EFFECT CORRIGIDO: Gerar imagens apenas uma vez quando pedidos mudam
    useEffect(() => {
        if (pedidos.length > 0 && !imagesGenerated) {
            console.log('🎯 Iniciando geração de imagens para todos os sneakers...');
            
            pedidos.forEach((pedido, pedidoIndex) => {
                if (pedido.items && Array.isArray(pedido.items)) {
                    // Extrair configuração do sneaker do resumo
                    const sneakerConfig = extractSneakerConfig(pedido.items);
                    const imageKey = `${pedidoIndex}`;
                    
                    // Só gera se não tiver imagem e não estiver carregando
                    if (!generatedImages[imageKey] && !loadingImages[imageKey]) {
                        console.log(`🔄 Agendando geração para sneaker ${pedidoIndex + 1}`);
                        // Usar setTimeout para evitar bloqueio
                        setTimeout(() => {
                            generateSneakerImage(pedidoIndex, sneakerConfig);
                        }, pedidoIndex * 1000); // Delay de 1 segundo entre cada
                    }
                }
            });
            
            setImagesGenerated(true);
        }
    }, [pedidos, imagesGenerated]);

    // 🚨 EFFECT para resetar quando pedidos mudarem completamente
    useEffect(() => {
        setImagesGenerated(false);
        setGeneratedImages({});
        setLoadingImages({});
        setImageErrors({});
    }, [pedidos.length]);

    // 🚨 FUNÇÃO SIMPLIFICADA
    const handleConfirmarPedidos = () => {
        console.log('✅ [CarrinhoPedido] Chamando onConfirmarPedidos...');
        console.log('📦 Número de pedidos:', pedidos.length);
        console.log('💰 Total geral:', totalGeral);
        
        onConfirmarPedidos();
    };

    // 🚨 CORREÇÃO: Se não há pedidos, mostrar mensagem
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
                    background-color: #FF9D00;
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
                    color: #FF9D00;
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
                    border: 2px solid #FF9D00;
                }
                
                .pedido-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 2px solid #FF9D00;
                }
                
                .pedido-title {
                    color: #FF9D00;
                    margin: 0;
                    font-size: 1.3rem;
                }
                
                .pedido-date {
                    color: #666;
                    font-size: 0.9rem;
                }
                
                .sneaker-image {
                    text-align: center;
                    margin: 1rem 0;
                }
                
                .image-placeholder {
                    background-color: #F5F5F5;
                    border-radius: 0.75rem;
                    padding: 2rem;
                    border: 2px dashed #FF9D00;
                    min-height: 200px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }
                
                .image-placeholder img {
                    max-width: 100%;
                    max-height: 200px;
                    border-radius: 0.5rem;
                    object-fit: cover;
                }
                
                .loading-spinner {
                    display: inline-block;
                    width: 20px;
                    height: 20px;
                    border: 3px solid #f3f3f3;
                    border-top: 3px solid #FF9D00;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                
                .loading-text {
                    margin-top: 10px;
                    color: #666;
                    text-align: center;
                }
                
                .error-message {
                    color: #ff4444;
                    text-align: center;
                    margin-top: 10px;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .pedido-divider {
                    border: none;
                    border-top: 2px dashed #FF9D00;
                    margin: 2rem 0;
                }
                
                .total-geral {
                    background-color: #fff8e1;
                    border: 2px solid #FF9D00;
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
                    color: #FF9D00;
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
                    background-color: #22C55E;
                    color: white;
                    font-weight: 600;
                    padding: 0.8rem;
                    border-radius: 9999px;
                    border: none;
                    transition: background-color 0.3s;
                    font-size: 1.1rem;
                    cursor: pointer;
                }
                
                .next-button:hover {
                    background-color: #1A9C4B;
                }
                
                .next-button:disabled {
                    background-color: #ccc;
                    cursor: not-allowed;
                }
                
                .add-more-button {
                    width: 100%;
                    max-width: 400px;
                    background-color: #FF9D00;
                    color: white;
                    font-weight: 600;
                    padding: 0.8rem;
                    border-radius: 9999px;
                    border: none;
                    transition: background-color 0.3s;
                    font-size: 1.1rem;
                    cursor: pointer;
                }
                
                .add-more-button:hover {
                    background-color: #e68a00;
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
                }
                
                @media (max-width: 480px) {
                    .title {
                        font-size: 1.5rem;
                    }
                    
                    .image-placeholder {
                        padding: 1.5rem 1rem;
                    }
                    
                    .next-button,
                    .add-more-button {
                        font-size: 0.95rem;
                        padding: 0.6rem;
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
                    {/* Lista de todos os pedidos */}
                    <div className="pedidos-list">
                        {pedidos.map((pedido, pedidoIndex) => {
                            if (!pedido) {
                                console.warn(`⚠️ Pedido ${pedidoIndex} é undefined`);
                                return null;
                            }

                            const itemsValidos = pedido.items && Array.isArray(pedido.items);
                            const totalPedido = pedido.valorTotal || 
                                              (itemsValidos ? pedido.items.reduce((sum, item) => {
                                                  if (!item) return sum;
                                                  return sum + (item.acrescimo || 0);
                                              }, 0) : 0);

                            const imageKey = `${pedidoIndex}`;
                            const imageUrl = generatedImages[imageKey];
                            const isLoading = loadingImages[imageKey];
                            const hasError = imageErrors[imageKey];

                            return (
                                <div key={pedido.id || pedidoIndex} className="pedido-item">
                                    <div className="pedido-header">
                                        <h3 className="pedido-title">Sneaker #{pedidoIndex + 1}</h3>
                                        <span className="pedido-date">Valor: R$ {totalPedido.toFixed(2)}</span>
                                    </div>
                                    
                                    {/* IMAGEM DO SNEAKER - COM FALLBACK SVG LOCAL */}
                                    <div className="sneaker-image">
                                        <div className="image-placeholder">
                                            {isLoading ? (
                                                <div style={{textAlign: 'center'}}>
                                                    <div className="loading-spinner"></div>
                                                    <p className="loading-text">Gerando imagem do sneaker...</p>
                                                    <small>Aguarde alguns segundos</small>
                                                </div>
                                            ) : imageUrl ? (
                                                <img 
                                                    src={imageUrl} 
                                                    alt={`Sneaker personalizado ${pedidoIndex + 1}`}
                                                    onError={(e) => {
                                                        console.error('❌ Erro ao carregar imagem, usando fallback SVG');
                                                        // Fallback para SVG local
                                                        const fallbackImage = createLocalFallbackSVG(
                                                            extractSneakerConfig(pedido.items), 
                                                            pedidoIndex
                                                        );
                                                        e.target.src = fallbackImage;
                                                    }}
                                                    style={{
                                                        maxWidth: '100%',
                                                        maxHeight: '200px',
                                                        borderRadius: '0.5rem',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                            ) : (
                                                <div style={{textAlign: 'center'}}>
                                                    <div className="loading-spinner"></div>
                                                    <p className="loading-text">Preparando imagem...</p>
                                                    <small>Carregando visualização</small>
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

                    {/* Total Geral */}
                    <div className="total-geral">
                        <div className="total-geral-content">
                            <span className="total-geral-label">Total do Pedido:</span>
                            <span className="total-geral-value">R$ {totalGeral.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Botões de ação */}
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