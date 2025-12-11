import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import Navbar from '../components/Navbar';

const API_BASE_URL = 'https://sneakerslab-backend.onrender.com';

const MeusPedidos = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { primaryColor } = useTheme();
    
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const statusColors = {
        pendente: '#FF9D00',
        confirmado: '#3B82F6',
        na_fila: '#8B5CF6',
        em_producao: '#8B5CF6',
        concluido: '#22C55E',
        em_transporte: '#F59E0B',
        entregue: '#10B981',
        cancelado: '#DC3545'
    };

    useEffect(() => {
        const fetchPedidos = async () => {
            if (!user?.id) {
                setError('Usuário não logado');
                setLoading(false);
                return;
            }

            try {
                console.log('🔍 Buscando pedidos para cliente ID:', user.id);
                
                const response = await fetch(`${API_BASE_URL}/api/orders/cliente/${user.id}`);
                
                if (!response.ok) {
                    throw new Error(`Erro ${response.status}: Falha ao buscar pedidos`);
                }
                
                const data = await response.json();
                console.log('✅ Dados recebidos:', data);
                
                if (data.success === false) {
                    throw new Error(data.error || 'API retornou success: false');
                }
                
                setPedidos(data.pedidos || []);
                
            } catch (err) {
                console.error('❌ Erro ao buscar pedidos:', err);
                setError(`Erro: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchPedidos();
    }, [user]);

    const formatarData = (dataString) => {
        if (!dataString) return 'N/A';
        try {
            return new Date(dataString).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch {
            return dataString;
        }
    };

    const formatarStatus = (status) => {
        const statusMap = {
            'pendente': 'PENDENTE',
            'confirmado': 'CONFIRMADO',
            'na_fila': 'NA FILA DE PRODUÇÃO',
            'em_producao': 'EM PRODUÇÃO',
            'concluido': 'PRODUÇÃO CONCLUÍDA',
            'em_transporte': 'EM TRANSPORTE',
            'entregue': 'ENTREGUE',
            'cancelado': 'CANCELADO'
        };
        return statusMap[status] || status?.toUpperCase() || 'PENDENTE';
    };

    const handleRastrearPedido = (pedido) => {
        const status = pedido.status_geral || 'pendente';
        
        // Só pode rastrear se o pedido não estiver pendente
        if (status === 'pendente') {
            alert('⏳ Este pedido ainda está pendente de processamento. O código de rastreio será gerado quando o pedido for confirmado.');
            return;
        }
        
        const codigosRastreio = pedido.codigos_rastreio || [];
        const codigoRastreio = codigosRastreio.length > 0 ? codigosRastreio[0] : pedido.codigo_rastreio;
        
        if (codigoRastreio) {
            navigate(`/rastrear-pedido/${codigoRastreio}`);
        } else {
            alert('📍 O código de rastreio ainda não foi gerado. Tente novamente em alguns minutos.');
        }
    };

    const handleDetalhesPedido = (pedidoId) => {
        // CORREÇÃO: Navegar para a página de detalhes do pedido
        navigate(`/pedido/${pedidoId}`);
    };

    const handleConfirmarEntrega = async (pedidoId) => {
        if (!window.confirm('Deseja confirmar a entrega deste pedido?')) return;
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/entrega/confirmar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pedidoId })
            });

            if (!response.ok) throw new Error('Erro ao confirmar entrega');

            alert('✅ Entrega confirmada com sucesso!');
            
            // Atualizar localmente
            setPedidos(prev => prev.map(pedido => 
                pedido.id === pedidoId 
                    ? { ...pedido, status_geral: 'entregue' }
                    : pedido
            ));
        } catch (error) {
            alert('Erro ao confirmar entrega: ' + error.message);
        }
    };

    if (!user) {
        return (
            <div className="login-required">
                <p>Você precisa estar logado para ver seus pedidos.</p>
                <button 
                    onClick={() => navigate('/login')}
                    style={{ backgroundColor: primaryColor }}
                >
                    Fazer Login
                </button>
                <style>{`
                    .login-required {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        height: 100vh;
                        gap: 1rem;
                    }
                    .login-required button {
                        padding: 0.75rem 1.5rem;
                        color: white;
                        border: none;
                        border-radius: 0.5rem;
                        cursor: pointer;
                    }
                `}</style>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            
            <div className="container">
                <div className="card">
                    <div className="header">
                        <h1>Histórico de Pedidos</h1>
                        <p>Seus pedidos personalizados e status de produção.</p>
                        
                        <div className="user-info">
                            <p><strong>👤 Cliente:</strong> {user.nome_usuario}</p>
                            <p><strong>🆔 ID:</strong> {user.id}</p>
                            <p><strong>📊 Total de Pedidos:</strong> {pedidos.length}</p>
                        </div>
                    </div>

                    {loading && (
                        <div className="loading">
                            <div className="spinner"></div>
                            <p>Carregando seus pedidos...</p>
                        </div>
                    )}
                    
                    {error && (
                        <div className="error">
                            <p><strong>Erro:</strong> {error}</p>
                            <p>Verifique se o seu Backend está rodando corretamente.</p>
                            <div className="error-actions">
                                <button onClick={() => window.location.reload()}>
                                    🔄 Tentar Novamente
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {!loading && !error && pedidos.length === 0 && (
                        <div className="empty">
                            <p>🎉 Nenhum pedido encontrado para sua conta.</p>
                            <p>Crie seu primeiro sneaker personalizado!</p>
                            <button 
                                onClick={() => navigate('/criar-sneaker')}
                                style={{ backgroundColor: primaryColor }}
                            >
                                🎨 Criar meu Primeiro Sneaker
                            </button>
                        </div>
                    )}

                    <div className="pedidos-list">
                        {pedidos.map((pedido) => {
                            const status = pedido.status_geral || 'pendente';
                            const statusFormatado = formatarStatus(status);
                            const totalProdutos = pedido.total_produtos || 0;
                            const quantidadeTotal = pedido.quantidade_total || totalProdutos;
                            const isConcluido = status === 'concluido' || status === 'entregue';
                            const podeRastrear = status !== 'pendente'; // Só pode rastrear se não estiver pendente
                            
                            return (
                                <div key={pedido.id} className="pedido">
                                    <div className="pedido-header">
                                        <h3>Pedido #{pedido.id}</h3>
                                        <span 
                                            className="status" 
                                            style={{ 
                                                backgroundColor: statusColors[status] || statusColors.pendente 
                                            }}
                                        >
                                            {statusFormatado}
                                        </span>
                                    </div>
                                    
                                    <div className="pedido-detalhes">
                                        <div className="detalhe">
                                            <strong>📅 Data do Pedido:</strong>
                                            <span>{formatarData(pedido.data_criacao)}</span>
                                        </div>
                                        <div className="detalhe">
                                            <strong>📦 Total de Itens:</strong>
                                            <span>{quantidadeTotal} item{quantidadeTotal !== 1 ? 's' : ''}</span>
                                        </div>
                                        <div className="detalhe">
                                            <strong>💰 Valor Total:</strong>
                                            <span className="valor">R$ {pedido.valor_total?.toFixed(2).replace('.', ',') || '0,00'}</span>
                                        </div>
                                        <div className="detalhe">
                                            <strong>💳 Pagamento:</strong>
                                            <span>{pedido.metodo_pagamento || 'Cartão'}</span>
                                        </div>
                                        
                                        {pedido.produtos && pedido.produtos.length > 0 && (
                                            <div className="detalhe">
                                                <strong>👟 Produtos:</strong>
                                                <div className="produtos-list">
                                                    {pedido.produtos.map((produto, idx) => (
                                                        <span key={idx} className="produto-item">
                                                            <span className="produto-cor" style={{ 
                                                                backgroundColor: produto.cor === 'branco' ? '#FFFFFF' : 
                                                                produto.cor === 'preto' ? '#000000' : 
                                                                produto.cor === 'azul' ? '#007BFF' : 
                                                                produto.cor === 'vermelho' ? '#DC3545' : 
                                                                produto.cor === 'verde' ? '#28A745' : '#FFC107',
                                                                border: '1px solid #ccc'
                                                            }}></span>
                                                            {produto.cor} - Tamanho {produto.tamanho || 42}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {pedido.codigos_rastreio && pedido.codigos_rastreio.length > 0 && (
                                            <div className="detalhe">
                                                <strong>📮 Códigos de Rastreio:</strong>
                                                <div className="codigos">
                                                    {pedido.codigos_rastreio.map((codigo, idx) => (
                                                        <span key={idx} className="codigo">{codigo}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="acoes">
                                        <button 
                                            onClick={() => handleDetalhesPedido(pedido.id)}
                                            className="btn-detalhes"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            📋 Ver Detalhes
                                        </button>
                                        
                                        <button 
                                            onClick={() => handleRastrearPedido(pedido)}
                                            className="btn-rastrear"
                                            style={{ 
                                                backgroundColor: podeRastrear ? '#3B82F6' : '#9CA3AF',
                                                cursor: podeRastrear ? 'pointer' : 'not-allowed'
                                            }}
                                            disabled={!podeRastrear}
                                            title={!podeRastrear ? 'Aguardando processamento do pedido' : 'Rastrear pedido'}
                                        >
                                            {podeRastrear ? '📦 Rastrear Pedido' : '⏳ Aguardando'}
                                        </button>
                                        
                                        {isConcluido && status !== 'entregue' && (
                                            <button 
                                                onClick={() => handleConfirmarEntrega(pedido.id)}
                                                className="btn-entregue"
                                                style={{ backgroundColor: '#10B981' }}
                                            >
                                                ✅ Confirmar Entrega
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="footer-buttons">
                        <button onClick={() => navigate('/perfil')}>← Voltar para Perfil</button>
                        <button 
                            onClick={() => navigate('/criar-sneaker')}
                            className="btn-novo"
                            style={{ backgroundColor: primaryColor }}
                        >
                            🎨 Criar Novo Sneaker
                        </button>
                    </div>
                </div>
            </div>
            
            <style>{`
                :root {
                    --primary-color: ${primaryColor};
                    --success: #28a745;
                    --error: #DC3545;
                    --gray-light: #f8f9fa;
                    --gray: #e9ecef;
                    --text: #333;
                    --text-light: #666;
                }

                /* Layout */
                .container {
                    padding: 5rem 1rem 2rem;
                    min-height: 100vh;
                    background: var(--gray-light);
                }

                .card {
                    max-width: 900px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 1.5rem;
                    padding: 2.5rem;
                    box-shadow: 0 15px 30px rgba(0,0,0,0.15);
                }

                /* Header */
                .header {
                    text-align: center;
                    margin-bottom: 2.5rem;
                }

                .header h1 {
                    font-size: 2.8rem;
                    font-weight: 800;
                    margin-bottom: 0.5rem;
                    background: linear-gradient(135deg, var(--primary-color) 0%, #ffb347 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .header p {
                    color: var(--text-light);
                    max-width: 600px;
                    margin: 0 auto 2rem;
                    line-height: 1.6;
                }

                .user-info {
                    background: rgba(0,0,0,0.02);
                    border-radius: 1rem;
                    padding: 1.5rem;
                    border: 1px solid var(--gray);
                    max-width: 500px;
                    margin: 0 auto;
                }

                .user-info p {
                    margin: 0.5rem 0;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                /* Estados */
                .loading, .error, .empty {
                    text-align: center;
                    padding: 2rem;
                    margin: 1.5rem 0;
                    border-radius: 1rem;
                }

                .loading {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                }

                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid var(--gray);
                    border-top: 3px solid var(--primary-color);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .error {
                    color: var(--error);
                    background: #f8d7da;
                    border: 1px solid #f5c6cb;
                }

                .error-actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                    margin-top: 1rem;
                }

                .error-actions button {
                    padding: 0.75rem 1.5rem;
                    background: var(--error);
                    color: white;
                    border: none;
                    border-radius: 0.5rem;
                    font-weight: 600;
                    cursor: pointer;
                }

                .empty {
                    background: #fafafa;
                    border: 2px dashed var(--gray);
                }

                .empty button {
                    padding: 1rem 2rem;
                    color: white;
                    border: none;
                    border-radius: 1rem;
                    font-weight: 700;
                    cursor: pointer;
                    margin-top: 1rem;
                }

                /* Lista de pedidos */
                .pedidos-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    margin: 2rem 0;
                }

                .pedido {
                    border: 2px solid var(--gray);
                    border-radius: 1rem;
                    padding: 1.5rem;
                    transition: all 0.3s ease;
                }

                .pedido:hover {
                    border-color: var(--primary-color);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
                }

                .pedido-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 2px solid var(--gray);
                }

                .pedido-header h3 {
                    margin: 0;
                    color: var(--text);
                    font-size: 1.3rem;
                }

                .status {
                    padding: 0.5rem 1rem;
                    border-radius: 9999px;
                    color: white;
                    font-weight: 600;
                    text-transform: uppercase;
                    font-size: 0.8rem;
                }

                /* Detalhes */
                .pedido-detalhes {
                    display: grid;
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                }

                .detalhe {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    flex-wrap: wrap;
                }

                .detalhe strong { 
                    color: var(--text-light); 
                    flex: 1;
                    min-width: 150px;
                }
                
                .detalhe span { 
                    color: var(--text); 
                    font-weight: 500;
                    flex: 2;
                    text-align: right;
                }
                
                .valor { 
                    color: var(--success); 
                    font-weight: 700; 
                    font-size: 1.2rem; 
                }

                .produtos-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    justify-content: flex-end;
                }

                .produto-item {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: #f8f9fa;
                    padding: 0.4rem 0.8rem;
                    border-radius: 0.5rem;
                    font-size: 0.9rem;
                    margin-bottom: 0.25rem;
                }

                .produto-cor {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    display: inline-block;
                    flex-shrink: 0;
                }

                .codigos {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                    justify-content: flex-end;
                }

                .codigo {
                    background: var(--gray);
                    padding: 0.4rem 0.8rem;
                    border-radius: 0.5rem;
                    font-family: monospace;
                    font-size: 0.85rem;
                }

                /* Botões */
                .acoes {
                    display: flex;
                    gap: 1rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid var(--gray);
                    flex-wrap: wrap;
                }

                .acoes button {
                    flex: 1;
                    padding: 0.9rem;
                    border: none;
                    border-radius: 0.75rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    min-width: 150px;
                    color: white;
                }

                .acoes button:disabled {
                    cursor: not-allowed;
                    opacity: 0.6;
                }

                .acoes button:hover:not(:disabled) {
                    opacity: 0.9;
                    transform: translateY(-1px);
                }

                .btn-detalhes {
                    background-color: var(--primary-color) !important;
                }

                .btn-rastrear {
                    background-color: #3B82F6 !important;
                }

                .btn-entregue {
                    background-color: #10B981 !important;
                }

                .footer-buttons {
                    margin-top: 3rem;
                    display: flex;
                    justify-content: space-between;
                    gap: 1rem;
                }

                .footer-buttons button {
                    padding: 1rem 2rem;
                    border-radius: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .footer-buttons button:first-child {
                    background: transparent;
                    color: var(--text);
                    border: 2px solid var(--text);
                }

                .footer-buttons button:first-child:hover {
                    background: var(--text);
                    color: white;
                }

                .footer-buttons .btn-novo {
                    color: white;
                    border: none;
                }

                .footer-buttons .btn-novo:hover {
                    opacity: 0.9;
                }

                /* Responsividade */
                @media (max-width: 768px) {
                    .container { padding-top: 4.5rem; }
                    .card { padding: 1.5rem; border-radius: 1.2rem; }
                    .header h1 { font-size: 2rem; }
                    .header p { font-size: 1rem; }
                    
                    .pedido-header { 
                        flex-direction: column; 
                        align-items: flex-start; 
                        gap: 0.75rem; 
                    }
                    
                    .detalhe { 
                        flex-direction: column; 
                        align-items: flex-start; 
                        gap: 0.25rem; 
                    }
                    
                    .detalhe strong, 
                    .detalhe span { 
                        text-align: left; 
                        width: 100%; 
                    }
                    
                    .produtos-list,
                    .codigos { 
                        justify-content: flex-start; 
                    }
                    
                    .acoes { 
                        flex-direction: column; 
                    }
                    
                    .acoes button {
                        width: 100%;
                    }
                    
                    .footer-buttons {
                        flex-direction: column;
                    }
                }

                @media (max-width: 480px) {
                    .card { 
                        padding: 1rem; 
                        margin: 0.5rem; 
                        border-radius: 1rem;
                    }
                    
                    .header h1 { 
                        font-size: 1.6rem; 
                    }
                    
                    .header p { 
                        font-size: 0.9rem; 
                    }
                    
                    .user-info {
                        padding: 1rem;
                    }
                }
            `}</style>
        </>
    );
};

export default MeusPedidos;