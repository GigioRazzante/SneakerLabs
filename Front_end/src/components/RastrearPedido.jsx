import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'; 
import { useAuth } from '../context/AuthContext.jsx';
import Footer from './Footer.jsx';

const BACKEND_URL = 'http://localhost:3001'; 

// ✅ FUNÇÕES AUXILIARES DEFINIDAS NO ESCOPO CORRETO
const formatarData = (dataString) => {
    try {
        const dataObj = new Date(dataString);
        return dataObj.toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return dataString;
    }
};

const formatStatus = (status) => {
    switch (status) {
        case 'PENDENTE':
            return { text: 'Aguardando Produção', color: '#FF9D00' };
        case 'CONCLUIDO':
            return { text: 'Pronto para Retirada (Concluído)', color: '#28A745' };
        case 'FILA':
            return { text: 'Em Fila de Montagem', color: '#007BFF' };
        case 'PRONTO':
            return { text: 'Produto Montado e no Slot', color: '#20C997' };
        case 'FALHA_ENVIO':
            return { text: 'Falha no Envio à Produção', color: '#DC3545' };
        default:
            return { text: status, color: '#6C757D' };
    }
};

const getProdutoTitle = (config) => {
    const parts = config.split('/');
    if (parts.length >= 2) {
        return `${parts[0].trim()} - Material: ${parts[1].trim()}`;
    }
    return config; 
};

function RastrearPedido() {
    const { pedidoId: pedidoIdParam } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [pedidoIdInput, setPedidoIdInput] = useState(pedidoIdParam || ''); 
    const [statusData, setStatusData] = useState(null);
    const [loading, setLoading] = useState(!!pedidoIdParam); 
    const [error, setError] = useState('');

    // 🚨 ADICIONADO: Debug para verificar o usuário
    useEffect(() => {
        console.log('🔐 Usuário no RastrearPedido:', user);
        console.log('📦 Pedido ID da URL:', pedidoIdParam);
    }, [user, pedidoIdParam]);

    const handleSearch = async (e) => {
        if (e) {
            e.preventDefault();
        }
        
        const currentPedidoId = e ? pedidoIdInput : pedidoIdParam; 

        if (!currentPedidoId) {
            setError('Por favor, digite o ID do Pedido.');
            setStatusData(null);
            return;
        }

        const pedidoId = parseInt(currentPedidoId); 

        setLoading(true);
        setError('');
        setStatusData(null); 

        try {
            // 🚨 CORREÇÃO: Verificar se o usuário está logado antes de enviar
            if (!user || !user.id) {
                setError('Usuário não identificado. Faça login novamente.');
                return;
            }

            const headers = {
                'Content-Type': 'application/json',
                'x-client-id': user.id.toString() // 🚨 ENVIAR SEMPRE
            };

            console.log(`🔍 Buscando pedido ${pedidoId} para cliente ${user.id}`);

            const response = await fetch(`${BACKEND_URL}/api/orders/${pedidoId}/status`, {
                headers: headers
            });
            
            console.log(`📡 Resposta do backend: ${response.status}`);
            
            // 🚨 CORREÇÃO: Tratamento específico para erro 401
            if (response.status === 401) {
                setError('Autenticação necessária. Faça login novamente.');
                return;
            }
            
            if (response.status === 403) {
                setError('Você não tem permissão para acessar este pedido.');
                return;
            }
            
            if (response.status === 404) {
                setError(`Pedido #${pedidoId} não encontrado no sistema.`);
                return;
            }

            if (!response.ok) {
                throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setStatusData(data);
            console.log('✅ Dados recebidos:', data);

        } catch (err) {
            console.error('❌ Erro na busca:', err);
            setError(`Falha na busca: ${err.message}. Verifique se o Backend está rodando.`);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        if (pedidoIdParam && user && user.id) {
            console.log('🔄 Buscando automaticamente...');
            handleSearch();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pedidoIdParam, user]); // 🚨 ADICIONADO: user como dependência

    if (!user) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <p>Você precisa estar logado para rastrear pedidos.</p>
                <button 
                    onClick={() => navigate('/login')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#FF9D00',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer'
                    }}
                >
                    Fazer Login
                </button>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            
            {/* ✅ CORREÇÃO: Adicionar estrutura principal com min-height */}
            <div style={{ 
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* ✅ CORREÇÃO: Container principal com padding para não ficar atrás da navbar */}
                <div style={{ 
                    flex: 1,
                    paddingTop: '6rem',
                    paddingBottom: '6rem',
                    minHeight: 'calc(100vh - 80px)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start'
                }}>
                    <div className="main-content-card" style={{
                        maxWidth: '900px', 
                        padding: '2rem 1.5rem',
                        margin: '0 auto',
                        width: '100%'
                    }}>
                        <h2 style={{ textAlign: 'center', color: '#1A1A1A', fontSize: '1.8rem' }}>🚚 Acompanhar Pedido</h2>
                        <p style={{ textAlign: 'center', color: '#666', marginBottom: '1.5rem' }}>
                            Digite o ID do pedido para rastrear o status de produção.
                        </p>
                        
                        {/* 🚨 ADICIONADO: Debug visual do usuário */}
                        <div style={{ 
                            textAlign: 'center', 
                            color: '#888', 
                            fontSize: '0.9rem', 
                            marginBottom: '1rem',
                            padding: '0.5rem',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '0.5rem',
                            border: '1px solid #e9ecef'
                        }}>
                            <p><strong>Usuário logado:</strong> {user.nome_usuario} (ID: {user.id})</p>
                            <p><strong>Pedido a ser rastreado:</strong> {pedidoIdParam || 'Nenhum'}</p>
                        </div>
                        
                        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
                            <input 
                                type="number"
                                placeholder="ID do Pedido (ex: 3)" 
                                value={pedidoIdInput}
                                onChange={(e) => setPedidoIdInput(e.target.value)}
                                disabled={loading}
                                className="input-rastreio"
                            />
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="button-rastreio"
                            >
                                {loading ? 'Buscando...' : 'Buscar Pedido'}
                            </button>
                        </form>

                        {error && (
                            <div className="error-message" style={{ 
                                color: '#DC3545', 
                                textAlign: 'center', 
                                fontWeight: 'bold',
                                marginBottom: '1.5rem',
                                padding: '1rem',
                                backgroundColor: '#f8d7da',
                                border: '1px solid #f5c6cb',
                                borderRadius: '0.5rem'
                            }}>
                                {error}
                            </div>
                        )}

                        {statusData && (
                            <div className="resultado-card">
                                <div className="pedido-geral-info">
                                    <h3>Pedido <span style={{color: '#FF9D00'}}>#{statusData.pedidoId}</span></h3>
                                    <p>Data do Pedido: <strong>{formatarData(statusData.dataCriacao)}</strong></p>
                                    <p>Status Geral: 
                                        <span style={{ color: formatStatus(statusData.statusGeral).color, marginLeft: '10px', fontWeight: 'bold' }}>
                                            {formatStatus(statusData.statusGeral).text}
                                        </span>
                                    </p>
                                </div>

                                <h4 className="produtos-title">Itens de Produção ({statusData.produtos.length})</h4>
                                
                                <ul className="produtos-lista">
                                    {statusData.produtos.map((produto, index) => (
                                        <li key={index} className="produto-item">
                                            <div className="produto-header">
                                                <span className="produto-nome">{getProdutoTitle(produto.configuracao)}</span>
                                                <span 
                                                    className="produto-status-badge"
                                                    style={{ backgroundColor: formatStatus(produto.status).color }}
                                                >
                                                    {formatStatus(produto.status).text}
                                                </span>
                                            </div>
                                            
                                            <div className="produto-detalhes">
                                                <p>Rastreio ID: <strong>{produto.rastreioId || 'Aguardando geração'}</strong></p>
                                                <p>Slot de Expedição: <strong>{produto.slotExpedicao || 'Na linha de produção'}</strong></p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    
                </div>
                <Footer/>
              
            </div>
           
            <style>{`
                /* ✅ CORREÇÃO: Estilos globais para a página */
                body {
                    margin: 0;
                    padding: 0;
                    min-height: 100vh;
                }

                .main-content-card {
                    background: #fff;
                    border-radius: 1rem;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
                }
                .input-rastreio {
                    flex-grow: 1; 
                    padding: 12px; 
                    border-radius: 0.5rem; 
                    border: 1px solid #ccc;
                    font-size: 1rem;
                }
                .button-rastreio {
                    padding: 12px 25px; 
                    background-color: var(--laranja-vibrante, #FF9D00); 
                    color: white; 
                    border: none; 
                    border-radius: 0.5rem;
                    cursor: pointer;
                    font-size: 1rem;
                    font-weight: bold;
                    transition: background-color 0.3s;
                }
                .button-rastreio:hover:not(:disabled) {
                    background-color: #e58a00;
                }
                .error-message {
                    color: #DC3545; 
                    text-align: center; 
                    font-weight: bold;
                    margin-bottom: 1.5rem;
                }
                .resultado-card {
                    border: 1px solid #ddd; 
                    padding: 1.5rem; 
                    border-radius: 1rem;
                }
                .pedido-geral-info {
                    padding-bottom: 1rem;
                    border-bottom: 1px dashed #eee;
                    margin-bottom: 1rem;
                }
                .produtos-title {
                    margin-top: 2rem; 
                    margin-bottom: 1rem; 
                    color: #333;
                    font-size: 1.1rem;
                    border-left: 4px solid #FF9D00;
                    padding-left: 10px;
                }
                .produtos-lista {
                    list-style: none; 
                    padding: 0;
                }
                .produto-item {
                    border: 1px solid #eee; 
                    padding: 15px; 
                    border-radius: 0.5rem; 
                    margin-bottom: 15px; 
                    background-color: white;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.02);
                }
                .produto-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-bottom: 10px;
                    margin-bottom: 10px;
                    border-bottom: 1px solid #f5f5f5;
                }
                .produto-nome {
                    font-weight: bold;
                    color: #1A1A1A;
                    font-size: 1rem;
                }
                .produto-status-badge {
                    padding: 0.3rem 0.7rem;
                    border-radius: 9999px;
                    color: white;
                    font-weight: 600;
                    font-size: 0.8rem;
                }
                .produto-detalhes p {
                    margin: 5px 0;
                    color: #555;
                    font-size: 0.9rem;
                }
            `}</style>
        </>
    );
}

export default RastrearPedido;