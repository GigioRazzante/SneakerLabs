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
        CONCLUIDO: '#22C55E',
        PENDENTE: '#FF9D00',
        CANCELADO: '#DC3545',
        ENTREGUE: '#6F42C1',
        pendente: '#FF9D00',  // Adicionado para compatibilidade (API usa lowercase)
        em_producao: '#3B82F6', // Adicionado para produção
        em_transporte: '#8B5CF6', // Adicionado para transporte
        concluido: '#22C55E', // Adicionado para compatibilidade
        entregue: '#6F42C1', // Adicionado para compatibilidade
        cancelado: '#DC3545', // Adicionado para compatibilidade
    };

    useEffect(() => {
        const fetchPedidos = async () => {
            if (!user?.id) {
                setError('Usuário não logado');
                setLoading(false);
                return;
            }

            try {
                // CORREÇÃO 1: URL corrigida - removido "/detalhado"
                const response = await fetch(`${API_BASE_URL}/api/orders/cliente/${user.id}`);
                if (!response.ok) throw new Error(`Falha ao buscar pedidos: ${response.status}`);
                
                const data = await response.json();
                
                if (!data.success) {
                    throw new Error(data.error || 'Erro na resposta da API');
                }
                
                // CORREÇÃO 2: A API retorna data.pedidos
                setPedidos(data.pedidos || []);
            } catch (err) {
                console.error('Erro ao buscar pedidos:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPedidos();
    }, [user]);

    const formatarData = (dataString) => {
        if (!dataString) return 'N/A';
        try {
            return new Date(dataString).toLocaleDateString('pt-BR');
        } catch {
            return dataString;
        }
    };

    const formatarStatus = (status) => {
        // Converte para uppercase para exibição
        const statusMap = {
            'pendente': 'PENDENTE',
            'em_producao': 'EM PRODUÇÃO',
            'em_transporte': 'EM TRANSPORTE',
            'concluido': 'CONCLUÍDO',
            'entregue': 'ENTREGUE',
            'cancelado': 'CANCELADO'
        };
        return statusMap[status] || status?.toUpperCase() || 'DESCONHECIDO';
    };

    const contarProdutos = (pedido) => {
        if (pedido.produtos && Array.isArray(pedido.produtos)) {
            return pedido.produtos.reduce((total, produto) => total + (produto.quantidade || 1), 0);
        }
        return 0;
    };

    const extrairCodigosRastreio = (pedido) => {
        if (pedido.codigo_rastreio) {
            return [pedido.codigo_rastreio];
        }
        
        // Alternativa: verificar nos produtos
        if (pedido.produtos && Array.isArray(pedido.produtos)) {
            const codigos = pedido.produtos
                .map(p => p.middleware_id)
                .filter(Boolean);
            return codigos.length > 0 ? codigos : [];
        }
        
        return [];
    };

    const handleRastrearPedido = (pedido) => {
        const codigos = extrairCodigosRastreio(pedido);
        const codigoRastreio = codigos.length > 0 ? codigos[0] : pedido.codigo_rastreio;
        
        if (codigoRastreio) {
            navigate(`/rastrear-pedido/${codigoRastreio}`);
        } else {
            alert('Este pedido ainda não tem código de rastreio disponível.');
        }
    };

    const handleConfirmarEntrega = async (pedidoId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/entrega/confirmar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pedidoId })
            });

            if (!response.ok) throw new Error('Erro ao confirmar entrega');

            alert('✅ Entrega confirmada com sucesso!');
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
                        <h1>Histórico de Pedidos</h1>
                        <p>Seus pedidos personalizados e status de produção.</p>
                        
                        <div className="user-info">
                            <p><strong>Cliente:</strong> {user.nome_usuario}</p>
                            <p><strong>ID:</strong> {user.id}</p>
                            <p><strong>Total de Pedidos:</strong> {pedidos.length}</p>
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
                            <p>Verifique se o Backend está rodando corretamente.</p>
                            <button onClick={() => window.location.reload()}>
                                Tentar Novamente
                            </button>
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
                        {pedidos.map(pedido => {
                            const status = pedido.status_geral || pedido.status || 'pendente';
                            const statusFormatado = formatarStatus(status);
                            const totalProdutos = contarProdutos(pedido);
                            const codigosRastreio = extrairCodigosRastreio(pedido);
                            
                            return (
                                <div key={pedido.id} className="pedido">
                                    <div className="pedido-header">
                                        <div className="pedido-info">
                                            <h3>Pedido #{pedido.id || pedido.pedido_id}</h3>
                                            <p className="data-pedido">
                                                {formatarData(pedido.data_criacao || pedido.data_pedido)}
                                            </p>
                                        </div>
                                        <span 
                                            className="status" 
                                            style={{ 
                                                backgroundColor: statusColors[status] || statusColors.PENDENTE 
                                            }}
                                        >
                                            {statusFormatado}
                                        </span>
                                    </div>
                                    
                                    <div className="pedido-detalhes">
                                        <div className="detalhe">
                                            <strong>Valor Total:</strong>
                                            <span className="valor">
                                                R$ {pedido.valor_total?.toFixed(2).replace('.', ',') || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="detalhe">
                                            <strong>Total de Itens:</strong>
                                            <span>{totalProdutos}</span>
                                        </div>
                                        <div className="detalhe">
                                            <strong>Método de Pagamento:</strong>
                                            <span>{pedido.metodo_pagamento || 'Não informado'}</span>
                                        </div>
                                        
                                        {codigosRastreio.length > 0 && (
                                            <div className="detalhe">
                                                <strong>Códigos de Rastreio:</strong>
                                                <div className="codigos">
                                                    {codigosRastreio.map((codigo, index) => (
                                                        <span key={index} className="codigo">
                                                            {codigo}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="acoes">
                                        <button 
                                            onClick={() => handleDetalhesPedido(pedido.id || pedido.pedido_id)}
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            📋 Ver Detalhes
                                        </button>
                                        
                                        <button 
                                            onClick={() => handleRastrearPedido(pedido)}
                                            className="rastrear-btn"
                                        >
                                            📦 Rastrear Pedido
                                        </button>
                                        
                                        {status === 'concluido' && (
                                            <button 
                                                onClick={() => handleConfirmarEntrega(pedido.id || pedido.pedido_id)}
                                                className="confirmar-btn"
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
                            className="voltar-btn"
                        >
                            ← Voltar para Perfil
                        </button>
                        <button 
                            onClick={() => navigate('/criar-sneaker')}
                            style={{ backgroundColor: primaryColor }}
                            className="novo-pedido-btn"
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
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 1rem;
                }

                .user-info p {
                    margin: 0;
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

                .error button {
                    margin-top: 1rem;
                    padding: 0.5rem 1rem;
                    background: var(--error);
                    color: white;
                    border: none;
                    border-radius: 0.5rem;
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
                    align-items: flex-start;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 2px solid var(--gray);
                    flex-wrap: wrap;
                    gap: 1rem;
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

                .status {
                    padding: 0.5rem 1rem;
                    border-radius: 9999px;
                    color: white;
                    font-weight: 600;
                    text-transform: uppercase;
                    font-size: 0.8rem;
                    white-space: nowrap;
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
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }

                .detalhe strong { 
                    color: var(--text-light); 
                    font-weight: 600;
                }
                
                .detalhe span { 
                    color: var(--text); 
                    font-weight: 500; 
                }
                
                .valor { 
                    color: var(--success); 
                    font-weight: 700; 
                    font-size: 1.2rem; 
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
                    min-width: 150px;
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
                }

                .acoes button:first-child { 
                    background: var(--primary-color); 
                    color: white; 
                }
                
                .rastrear-btn { 
                    background: #3B82F6; 
                    color: white; 
                }
                
                .confirmar-btn { 
                    background: var(--success); 
                    color: white; 
                }

                .footer-buttons {
                    margin-top: 3rem;
                    display: flex;
                    justify-content: space-between;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                .footer-buttons button {
                    padding: 1rem 2rem;
                    border-radius: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    min-width: 200px;
                }

                .voltar-btn {
                    background: transparent;
                    color: var(--text);
                    border: 2px solid var(--text);
                }

                .voltar-btn:hover {
                    background: var(--text);
                    color: white;
                }

                .novo-pedido-btn {
                    color: white;
                    border: none;
                }

                /* Responsividade */
                @media (max-width: 768px) {
                    .container { padding-top: 4.5rem; }
                    .card { padding: 1.5rem; border-radius: 1.2rem; }
                    .header h1 { font-size: 2rem; }
                    .header p { font-size: 1rem; }
                    .pedido-header { flex-direction: column; align-items: flex-start; }
                    .detalhe { flex-direction: column; align-items: flex-start; }
                    .codigos { justify-content: flex-start; }
                    .acoes { flex-direction: column; }
                    .acoes button { width: 100%; }
                    .footer-buttons { flex-direction: column; }
                    .footer-buttons button { width: 100%; }
                }

                @media (max-width: 480px) {
                    .card { padding: 1rem; margin: 0.5rem; }
                    .header h1 { font-size: 1.6rem; }
                    .header p { font-size: 0.9rem; }
                    .user-info { grid-template-columns: 1fr; }
                }
            `}</style>
        </>
    );
}

export default MeusPedidos;