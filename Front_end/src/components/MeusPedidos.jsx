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
    const [debugInfo, setDebugInfo] = useState('');

    const statusColors = {
        pendente: '#FF9D00',       // Laranja
        confirmado: '#3B82F6',     // Azul
        na_fila: '#8B5CF6',        // Roxo - NOVO STATUS
        em_producao: '#8B5CF6',    // Roxo
        concluido: '#22C55E',      // Verde
        em_transporte: '#F59E0B',  // Amarelo
        entregue: '#10B981',       // Verde escuro
        cancelado: '#DC3545'       // Vermelho
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
                setDebugInfo(`Buscando: ${API_BASE_URL}/api/orders/cliente/${user.id}`);
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);
                
                const response = await fetch(`${API_BASE_URL}/api/orders/cliente/${user.id}`, {
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                setDebugInfo(prev => prev + `\nStatus: ${response.status} ${response.statusText}`);
                
                if (!response.ok) {
                    let errorMessage = `Erro ${response.status}: `;
                    
                    try {
                        const errorData = await response.json();
                        errorMessage += errorData.error || JSON.stringify(errorData);
                    } catch {
                        const textError = await response.text();
                        errorMessage += textError || 'Erro desconhecido';
                    }
                    
                    throw new Error(errorMessage);
                }
                
                const data = await response.json();
                console.log('✅ Dados recebidos:', data);
                setDebugInfo(prev => prev + `\nResposta: ${JSON.stringify(data).substring(0, 200)}...`);
                
                if (data.success === false) {
                    throw new Error(data.error || 'API retornou success: false');
                }
                
                setPedidos(data.pedidos || []);
                
            } catch (err) {
                console.error('❌ Erro completo:', err);
                setError(`Erro: ${err.message}`);
                
                if (err.name === 'AbortError') {
                    setError('Timeout: O servidor demorou muito para responder.');
                }
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
            'na_fila': 'NA FILA DE PRODUÇÃO',  // NOVO
            'em_producao': 'EM PRODUÇÃO',
            'concluido': 'PRODUÇÃO CONCLUÍDA',
            'em_transporte': 'EM TRANSPORTE',
            'entregue': 'ENTREGUE',
            'cancelado': 'CANCELADO'
        };
        return statusMap[status] || status?.toUpperCase() || 'PENDENTE';
    };

    const contarProdutos = (pedido) => {
        // ✅ CORRETO: Usa total_produtos da API ou conta produtos
        if (pedido.total_produtos && pedido.total_produtos > 0) {
            return pedido.total_produtos;
        }
        
        if (pedido.produtos && Array.isArray(pedido.produtos)) {
            return pedido.produtos.length;
        }
        
        // Fallback mínimo
        return 1;
    };

    const calcularQuantidadeTotal = (pedido) => {
        // ✅ CORRETO: Usa quantidade_total da API ou soma
        if (pedido.quantidade_total && pedido.quantidade_total > 0) {
            return pedido.quantidade_total;
        }
        
        if (pedido.produtos && Array.isArray(pedido.produtos)) {
            return pedido.produtos.reduce((total, produto) => total + (produto.quantidade || 1), 0);
        }
        
        return contarProdutos(pedido);
    };

    const extrairCodigosRastreio = (pedido) => {
        if (pedido.codigos_rastreio && Array.isArray(pedido.codigos_rastreio)) {
            return pedido.codigos_rastreio;
        }
        
        const codigos = [];
        if (pedido.codigo_rastreio) {
            codigos.push(pedido.codigo_rastreio);
        }
        if (pedido.middleware_id) {
            codigos.push(pedido.middleware_id);
        }
        
        return codigos;
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

    const handleDemonstracaoAutomatica = async (pedidoId) => {
        if (!window.confirm('🎬 INICIAR DEMONSTRAÇÃO AUTOMÁTICA\n\nO pedido passará por todos os status automaticamente:\n1. Confirmado (1s)\n2. Na fila (2s)\n3. Em produção (3s)\n4. Concluído (4s)\n5. Em transporte (3s)\n6. Entregue (2s)\n\nDuração total: 15 segundos')) {
            return;
        }
        
        try {
            setLoading(true);
            
            const response = await fetch(`${API_BASE_URL}/api/orders/demonstracao/${pedidoId}`, {
                method: 'POST'
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert(`✅ DEMONSTRAÇÃO INICIADA!\n\nPedido #${pedidoId}\nDuração: ${data.duracao_total}\n\nA página será atualizada automaticamente.`);
                
                // Atualizar após 16 segundos
                setTimeout(() => {
                    window.location.reload();
                }, 16000);
            } else {
                alert('Erro: ' + data.error);
            }
        } catch (error) {
            alert('Erro ao iniciar demonstração: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleMudarStatus = async (pedidoId, statusAtual) => {
        const fluxo = {
            'pendente': ['confirmado', 'cancelado'],
            'confirmado': ['na_fila', 'cancelado'],
            'na_fila': ['em_producao', 'cancelado'],
            'em_producao': ['concluido', 'cancelado'],
            'concluido': ['em_transporte'],
            'em_transporte': ['entregue'],
            'entregue': [],
            'cancelado': []
        };
        
        const opcoes = fluxo[statusAtual] || [];
        
        if (opcoes.length === 0) {
            alert('✅ Este pedido já completou todo o fluxo!');
            return;
        }
        
        const novoStatus = prompt(
            `Mudar status do pedido #${pedidoId}\n\n` +
            `📊 Status atual: ${formatarStatus(statusAtual)}\n\n` +
            `🔄 Opções disponíveis:\n${opcoes.map(op => `• ${formatarStatus(op)}`).join('\n')}\n\n` +
            `Digite o novo status (ex: "confirmado", "na_fila", etc):`
        );
        
        if (!novoStatus || !opcoes.includes(novoStatus)) {
            alert('Status inválido ou ação cancelada');
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/orders/${pedidoId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: novoStatus })
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert(`✅ STATUS ALTERADO!\n\n${data.message}\n${data.descricao}`);
                window.location.reload(); // Recarregar para ver mudanças
            } else {
                alert('Erro: ' + data.error);
            }
        } catch (error) {
            alert('Erro ao mudar status: ' + error.message);
        }
    };

    const handleDetalhesPedido = (pedidoId) => {
        navigate(`/pedido/${pedidoId}`);
    };

    const testarBackendConnection = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch(`${API_BASE_URL}/api/health`);
            const data = await response.json();
            
            setDebugInfo(`Health Check: ${JSON.stringify(data, null, 2)}`);
            
            if (data.status === 'healthy') {
                alert('✅ Backend está funcionando perfeitamente!\n\n' +
                      'Banco: ' + (data.database?.status || 'OK') + '\n' +
                      'Queue Smart: ' + (data.queue_smart?.status || 'OK'));
            } else {
                alert(`⚠️ Backend com problemas: ${data.message}`);
            }
        } catch (err) {
            setError(`Health Check falhou: ${err.message}`);
        } finally {
            setLoading(false);
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
                        <h1>📦 Meus Pedidos - SneakerLabs</h1>
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
                            <button 
                                onClick={testarBackendConnection} 
                                className="test-btn"
                                style={{ backgroundColor: primaryColor }}
                            >
                                🔍 Testar Conexão
                            </button>
                        </div>
                    </div>

                    {debugInfo && (
                        <div className="debug-info">
                            <h4>🔧 Informações de Debug:</h4>
                            <pre>{debugInfo}</pre>
                        </div>
                    )}

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
                        {pedidos.map((pedido, index) => {
                            const status = pedido.status_geral || 'pendente';
                            const statusFormatado = formatarStatus(status);
                            const totalProdutos = contarProdutos(pedido);
                            const quantidadeTotal = calcularQuantidadeTotal(pedido);
                            const codigosRastreio = extrairCodigosRastreio(pedido);
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
                                                {totalProdutos !== quantidadeTotal ? ` (${totalProdutos} produto${totalProdutos !== 1 ? 's' : ''})` : ''}
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
                                            <div className="detalhe-item">
                                                <strong>📍 Status:</strong>
                                                <span>{statusFormatado}</span>
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
                                                            {produto.configuracoes && (
                                                                <small className="config-info">
                                                                    {produto.configuracoes.estilo}, {produto.configuracoes.material}
                                                                </small>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {codigosRastreio.length > 0 && (
                                            <div className="rastreio-info">
                                                <strong>📮 Códigos de Rastreio:</strong>
                                                <div className="codigos-list">
                                                    {codigosRastreio.map((codigo, idx) => (
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
                                        
                                        <button 
                                            onClick={() => handleDemonstracaoAutomatica(pedido.id)}
                                            className="btn-demo"
                                            style={{ backgroundColor: '#8B5CF6' }}
                                            title="Mostrar fluxo completo automaticamente"
                                        >
                                            🎬 Demo Automática
                                        </button>
                                        
                                        <button 
                                            onClick={() => handleMudarStatus(pedido.id, status)}
                                            className="btn-mudar-status"
                                            style={{ backgroundColor: '#F59E0B' }}
                                            title="Mudar status manualmente"
                                        >
                                            🔄 Mudar Status
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

                /* Layout */
                .container {
                    padding: 5rem 1rem 2rem;
                    min-height: 100vh;
                    background: var(--gray-light);
                }

                .card {
                    max-width: 1200px;
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

                .subtitle {
                    color: var(--text-light);
                    max-width: 600px;
                    margin: 0 auto 2rem;
                    line-height: 1.6;
                    font-size: 1.2rem;
                }

                .user-info {
                    background: rgba(0,0,0,0.02);
                    border-radius: 1rem;
                    padding: 1.5rem;
                    border: 1px solid var(--gray);
                    max-width: 800px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 1rem;
                    align-items: center;
                }

                .info-item {
                    text-align: center;
                }

                .test-btn {
                    padding: 0.75rem 1.5rem;
                    color: white;
                    border: none;
                    border-radius: 0.75rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .test-btn:hover {
                    opacity: 0.9;
                    transform: translateY(-2px);
                }

                /* Debug Info */
                .debug-info {
                    background: #e9ecef;
                    padding: 1rem;
                    border-radius: 0.5rem;
                    margin: 1rem 0;
                    font-family: 'Courier New', monospace;
                    font-size: 0.85rem;
                    max-height: 200px;
                    overflow-y: auto;
                }

                .debug-info pre {
                    white-space: pre-wrap;
                    word-wrap: break-word;
                    margin: 0;
                }

                /* Estados */
                .loading, .error, .empty {
                    text-align: center;
                    padding: 2rem;
                    border-radius: 1rem;
                    margin: 1.5rem 0;
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

                /* Lista de pedidos */
                .pedidos-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    margin: 2rem 0;
                }

                .pedido-card {
                    border: 2px solid var(--gray);
                    border-radius: 1rem;
                    padding: 1.5rem;
                    transition: all 0.3s ease;
                    background: white;
                }

                .pedido-card:hover {
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
                    font-size: 1.5rem;
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
                    background: #f8f9fa;
                    padding: 0.25rem 0.75rem;
                    border-radius: 0.5rem;
                    display: inline-block;
                }

                .status-badge {
                    padding: 0.5rem 1.2rem;
                    border-radius: 9999px;
                    color: white;
                    font-weight: 600;
                    text-transform: uppercase;
                    font-size: 0.8rem;
                    white-space: nowrap;
                    letter-spacing: 0.5px;
                }

                /* Detalhes */
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
                    font-weight: 600;
                }

                .detalhe-item span {
                    color: var(--text);
                    font-weight: 500;
                    font-size: 1.1rem;
                }

                .valor {
                    color: var(--success);
                    font-weight: 700;
                    font-size: 1.3rem;
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

                .config-info {
                    color: var(--text-light);
                    font-style: italic;
                    margin-left: 0.5rem;
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

                /* Botões de ação */
                .pedido-actions {
                    display: flex;
                    gap: 0.75rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid var(--gray);
                    flex-wrap: wrap;
                }

                .pedido-actions button {
                    flex: 1;
                    min-width: 140px;
                    padding: 0.75rem;
                    border: none;
                    border-radius: 0.75rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    color: white;
                }

                .btn-detalhes:hover, .btn-rastrear:hover, 
                .btn-demo:hover, .btn-mudar-status:hover,
                .btn-entregue:hover {
                    opacity: 0.9;
                    transform: translateY(-2px);
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
                    transform: translateY(-2px);
                }

                /* Responsividade */
                @media (max-width: 768px) {
                    .container { padding-top: 4.5rem; }
                    .card { padding: 1.5rem; border-radius: 1.2rem; }
                    .header h1 { font-size: 2rem; }
                    .subtitle { font-size: 1rem; }
                    .user-info { grid-template-columns: 1fr; }
                    .pedido-header { flex-direction: column; }
                    .detalhe-grid { grid-template-columns: 1fr; }
                    .pedido-actions { flex-direction: column; }
                    .pedido-actions button { width: 100%; }
                    .footer-buttons { flex-direction: column; }
                    .footer-buttons button { width: 100%; }
                }

                @media (max-width: 480px) {
                    .card { padding: 1rem; margin: 0.5rem; }
                    .header h1 { font-size: 1.6rem; }
                    .status-badge { font-size: 0.7rem; padding: 0.4rem 0.8rem; }
                }
            `}</style>
        </>
    );
};

export default MeusPedidos;
