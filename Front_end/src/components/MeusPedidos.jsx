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
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
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
        const codigosRastreio = pedido.codigos_rastreio || [];
        const codigoRastreio = codigosRastreio.length > 0 ? codigosRastreio[0] : pedido.codigo_rastreio;
        
        if (codigoRastreio) {
            navigate(`/rastrear-pedido/${codigoRastreio}`);
        } else {
            alert('Este pedido ainda não tem código de rastreio disponível.');
        }
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

    const handleDetalhesPedido = (pedidoId) => {
        navigate(`/pedido/${pedidoId}`);
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
                        <h1>📦 Meus Pedidos</h1>
                        <p className="subtitle">Acompanhe seus sneakers personalizados</p>
                        
                        <div className="user-info">
                            <div className="info-item">
                                <strong>👤 Cliente:</strong> {user.nome_usuario}
                            </div>
                            <div className="info-item">
                                <strong>🆔 ID:</strong> {user.id}
                            </div>
                            <div className="info-item">
                                <strong>📊 Total de Pedidos:</strong> {pedidos.length}
                            </div>
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
                            <h3>❌ Erro ao carregar pedidos</h3>
                            <p>{error}</p>
                            <div className="error-actions">
                                <button onClick={() => window.location.reload()}>
                                    🔄 Tentar Novamente
                                </button>
                                <button 
                                    onClick={() => navigate('/criar-sneaker')}
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    🎨 Criar Novo Pedido
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
                            
                            return (
                                <div key={pedido.id} className="pedido-card">
                                    <div className="pedido-header">
                                        <div className="pedido-info">
                                            <h3>Pedido #{pedido.id}</h3>
                                            <p className="data-pedido">
                                                📅 {formatarData(pedido.data_criacao)}
                                            </p>
                                            <p className="total-itens">
                                                📦 {quantidadeTotal} item{quantidadeTotal !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                        <span 
                                            className="status-badge" 
                                            style={{ 
                                                backgroundColor: statusColors[status] || statusColors.pendente 
                                            }}
                                        >
                                            {statusFormatado}
                                        </span>
                                    </div>
                                    
                                    <div className="pedido-detalhes">
                                        <div className="detalhe-grid">
                                            <div className="detalhe-item">
                                                <strong>💰 Valor Total:</strong>
                                                <span className="valor">R$ {pedido.valor_total?.toFixed(2).replace('.', ',') || '0,00'}</span>
                                            </div>
                                            <div className="detalhe-item">
                                                <strong>💳 Pagamento:</strong>
                                                <span>{pedido.metodo_pagamento || 'Cartão'}</span>
                                            </div>
                                            <div className="detalhe-item">
                                                <strong>🏭 Produção:</strong>
                                                <span>{formatarStatus(pedido.status_producao || status)}</span>
                                            </div>
                                        </div>
                                        
                                        {pedido.produtos && pedido.produtos.length > 0 && (
                                            <div className="produtos-info">
                                                <strong>👟 Produtos:</strong>
                                                <div className="produtos-list">
                                                    {pedido.produtos.map((produto, idx) => (
                                                        <div key={idx} className="produto-item">
                                                            <span className="produto-cor" style={{ 
                                                                backgroundColor: produto.cor === 'branco' ? '#FFFFFF' : 
                                                                produto.cor === 'preto' ? '#000000' : 
                                                                produto.cor === 'azul' ? '#007BFF' : 
                                                                produto.cor === 'vermelho' ? '#DC3545' : 
                                                                produto.cor === 'verde' ? '#28A745' : '#FFC107',
                                                                border: '1px solid #ccc'
                                                            }}></span>
                                                            <span>{produto.cor} - Tamanho {produto.tamanho || 42}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {pedido.codigos_rastreio && pedido.codigos_rastreio.length > 0 && (
                                            <div className="rastreio-info">
                                                <strong>📮 Códigos de Rastreio:</strong>
                                                <div className="codigos-list">
                                                    {pedido.codigos_rastreio.map((codigo, idx) => (
                                                        <span key={idx} className="codigo-badge">
                                                            {codigo}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="pedido-actions">
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
                                            style={{ backgroundColor: '#3B82F6' }}
                                        >
                                            📦 Rastrear Pedido
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
                        <button 
                            onClick={() => navigate('/perfil')}
                            className="btn-voltar"
                        >
                            ← Voltar para Perfil
                        </button>
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

                .container {
                    padding: 5rem 1rem 2rem;
                    min-height: 100vh;
                    background: var(--gray-light);
                }

                .card {
                    max-width: 1000px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 1.5rem;
                    padding: 2rem;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                }

                .header {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .header h1 {
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                    color: var(--primary-color);
                }

                .subtitle {
                    color: var(--text-light);
                    margin-bottom: 2rem;
                    font-size: 1.1rem;
                }

                .user-info {
                    background: rgba(0,0,0,0.02);
                    border-radius: 1rem;
                    padding: 1.2rem;
                    border: 1px solid var(--gray);
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                    margin: 0 auto;
                    max-width: 800px;
                }

                .info-item {
                    text-align: center;
                }

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
                    background: #f8d7da;
                    color: #721c24;
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

                .pedidos-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    margin: 2rem 0;
                }

                .pedido-card {
                    border: 1px solid var(--gray);
                    border-radius: 1rem;
                    padding: 1.5rem;
                    background: white;
                }

                .pedido-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid var(--gray);
                }

                .pedido-info h3 {
                    margin: 0;
                    color: var(--text);
                    font-size: 1.3rem;
                }

                .pedido-info .data-pedido {
                    color: var(--text-light);
                    font-size: 0.9rem;
                    margin-top: 0.25rem;
                }

                .pedido-info .total-itens {
                    color: var(--text);
                    font-weight: 600;
                    margin-top: 0.5rem;
                }

                .status-badge {
                    padding: 0.5rem 1rem;
                    border-radius: 9999px;
                    color: white;
                    font-weight: 600;
                    font-size: 0.8rem;
                    white-space: nowrap;
                }

                .pedido-detalhes {
                    margin-bottom: 1.5rem;
                }

                .detalhe-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .detalhe-item {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .detalhe-item strong {
                    color: var(--text-light);
                    font-size: 0.9rem;
                }

                .detalhe-item span {
                    color: var(--text);
                    font-weight: 500;
                }

                .valor {
                    color: var(--success);
                    font-weight: 700;
                    font-size: 1.2rem;
                }

                .produtos-info, .rastreio-info {
                    margin-top: 1rem;
                    padding-top: 1rem;
                    border-top: 1px solid var(--gray);
                }

                .produtos-info strong, .rastreio-info strong {
                    display: block;
                    margin-bottom: 0.5rem;
                    color: var(--text-light);
                }

                .produtos-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }

                .produto-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: #f8f9fa;
                    padding: 0.5rem 0.75rem;
                    border-radius: 0.5rem;
                    font-size: 0.9rem;
                }

                .produto-cor {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    display: inline-block;
                }

                .codigos-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }

                .codigo-badge {
                    background: var(--gray);
                    padding: 0.4rem 0.8rem;
                    border-radius: 0.5rem;
                    font-family: monospace;
                    font-size: 0.85rem;
                }

                .pedido-actions {
                    display: flex;
                    gap: 0.75rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid var(--gray);
                    flex-wrap: wrap;
                }

                .pedido-actions button {
                    padding: 0.75rem 1.5rem;
                    border: none;
                    border-radius: 0.5rem;
                    font-weight: 600;
                    cursor: pointer;
                    color: white;
                    flex: 1;
                    min-width: 150px;
                }

                .footer-buttons {
                    margin-top: 3rem;
                    display: flex;
                    justify-content: space-between;
                    gap: 1rem;
                }

                .footer-buttons button {
                    padding: 1rem 2rem;
                    border-radius: 0.75rem;
                    font-weight: 600;
                    cursor: pointer;
                }

                .btn-voltar {
                    background: transparent;
                    color: var(--text);
                    border: 2px solid var(--text);
                }

                .btn-voltar:hover {
                    background: var(--text);
                    color: white;
                }

                .btn-novo {
                    color: white;
                    border: none;
                }

                .btn-novo:hover {
                    opacity: 0.9;
                }

                @media (max-width: 768px) {
                    .container { padding-top: 4.5rem; }
                    .card { padding: 1.5rem; }
                    .header h1 { font-size: 2rem; }
                    .user-info { grid-template-columns: 1fr; }
                    .pedido-header { flex-direction: column; gap: 1rem; }
                    .detalhe-grid { grid-template-columns: 1fr; }
                    .pedido-actions { flex-direction: column; }
                    .pedido-actions button { width: 100%; }
                    .footer-buttons { flex-direction: column; }
                    .footer-buttons button { width: 100%; }
                }

                @media (max-width: 480px) {
                    .card { padding: 1rem; }
                    .header h1 { font-size: 1.6rem; }
                }
            `}</style>
        </>
    );
};

export default MeusPedidos;