import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'; 
import { useAuth } from '../context/AuthContext.jsx';

const BACKEND_URL = 'http://localhost:3001'; 

// ✅ FUNÇÕES AUXILIARES
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
            return { text: 'Pronto para Retirada', color: '#28A745' };
        case 'FILA':
            return { text: 'Em Fila de Montagem', color: '#007BFF' };
        case 'PRONTO':
            return { text: 'Produto Montado', color: '#20C997' };
        case 'FALHA_ENVIO':
            return { text: 'Falha no Envio', color: '#DC3545' };
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
            if (!user || !user.id) {
                setError('Usuário não identificado. Faça login novamente.');
                return;
            }

            const headers = {
                'Content-Type': 'application/json',
                'x-client-id': user.id.toString()
            };

            console.log(`🔍 Buscando pedido ${pedidoId} para cliente ${user.id}`);

            const response = await fetch(`${BACKEND_URL}/api/orders/${pedidoId}/status`, {
                headers: headers
            });
            
            console.log(`📡 Resposta do backend: ${response.status}`);
            
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
    }, [pedidoIdParam, user]);

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
            
            <div className="page-container">
                <div className="main-content-card">
                    <div className="title-section">
                        <h2 className="title">🚚 Acompanhar Pedido</h2>
                        <p className="subtitle">Digite o ID do pedido para rastrear o status de produção.</p>
                        
                        {/* Informações do usuário */}
                        <div className="user-info-card">
                            <p><strong>Usuário logado:</strong> {user.nome_usuario} (ID: {user.id})</p>
                            <p><strong>Pedido a ser rastreado:</strong> {pedidoIdParam || 'Nenhum'}</p>
                        </div>
                    </div>

                    {/* Formulário de busca */}
                    <form onSubmit={handleSearch} className="search-form">
                        <div className="input-group">
                            <input 
                                type="number"
                                placeholder="ID do Pedido (ex: 3)" 
                                value={pedidoIdInput}
                                onChange={(e) => setPedidoIdInput(e.target.value)}
                                disabled={loading}
                                className="search-input"
                            />
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="search-button"
                            >
                                {loading ? 'Buscando...' : 'Buscar Pedido'}
                            </button>
                        </div>
                    </form>

                    {/* Mensagem de erro */}
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    {/* Resultados */}
                    {statusData && (
                        <div className="resultado-card">
                            <div className="pedido-geral-info">
                                <h3>Pedido <span className="pedido-number">#{statusData.pedidoId}</span></h3>
                                <div className="pedido-details-grid">
                                    <p><strong>Data do Pedido:</strong> {formatarData(statusData.dataCriacao)}</p>
                                    <p><strong>Status Geral:</strong> 
                                        <span className="status-badge" style={{ backgroundColor: formatStatus(statusData.statusGeral).color }}>
                                            {formatStatus(statusData.statusGeral).text}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <h4 className="produtos-title">Itens de Produção ({statusData.produtos.length})</h4>
                            
                            <div className="produtos-lista">
                                {statusData.produtos.map((produto, index) => (
                                    <div key={index} className="produto-item">
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
                                            <p><strong>Rastreio ID:</strong> {produto.rastreioId || 'Aguardando geração'}</p>
                                            <p><strong>Slot de Expedição:</strong> {produto.slotExpedicao || 'Na linha de produção'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
           
           
            <style>{`
                /* ESTILOS RESPONSIVOS */
                .page-container {
                    padding-top: 5rem;
                    padding-bottom: 2rem;
                    width: 100%;
                    min-height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                    box-sizing: border-box;
                }

                .main-content-card {
                    width: 95%;
                    max-width: 900px;
                    background-color: white;
                    border-radius: 1.5rem;
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
                    padding: 2.5rem;
                    margin: 1.5rem 0;
                    position: relative;
                }

                .title-section {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .title {
                    font-size: 2.2rem;
                    font-weight: bold;
                    color: #1A1A1A;
                    margin-bottom: 0.5rem;
                }

                .subtitle {
                    color: #666;
                    margin-top: 0.5rem;
                    font-size: 1.1rem;
                    margin-bottom: 1.5rem;
                }

                .user-info-card {
                    background-color: #f8f9fa;
                    border-radius: 0.5rem;
                    padding: 1rem;
                    border: 1px solid #e9ecef;
                    text-align: left;
                    max-width: 400px;
                    margin: 0 auto;
                }

                .user-info-card p {
                    margin: 0.3rem 0;
                    color: #666;
                    font-size: 0.9rem;
                }

                /* FORMULÁRIO DE BUSCA */
                .search-form {
                    margin-bottom: 2rem;
                }

                .input-group {
                    display: flex;
                    gap: 0.75rem;
                    width: 100%;
                }

                .search-input {
                    flex-grow: 1;
                    padding: 0.75rem 1rem;
                    border-radius: 0.5rem;
                    border: 1px solid #ddd;
                    font-size: 1rem;
                    transition: border-color 0.3s;
                }

                .search-input:focus {
                    outline: none;
                    border-color: #FF9D00;
                    box-shadow: 0 0 0 2px rgba(255, 157, 0, 0.1);
                }

                .search-button {
                    padding: 0.75rem 1.5rem;
                    background-color: #FF9D00;
                    color: white;
                    border: none;
                    border-radius: 0.5rem;
                    cursor: pointer;
                    font-size: 1rem;
                    font-weight: 600;
                    transition: background-color 0.3s;
                    white-space: nowrap;
                }

                .search-button:hover:not(:disabled) {
                    background-color: #e68a00;
                }

                .search-button:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                /* MENSAGENS DE ERRO */
                .error-message {
                    color: #DC3545;
                    text-align: center;
                    font-weight: 600;
                    margin-bottom: 1.5rem;
                    padding: 1rem;
                    background-color: #f8d7da;
                    border: 1px solid #f5c6cb;
                    border-radius: 0.5rem;
                }

                /* CARD DE RESULTADOS */
                .resultado-card {
                    border: 1px solid #e9ecef;
                    padding: 1.5rem;
                    border-radius: 1rem;
                    background-color: #fafafa;
                }

                .pedido-geral-info {
                    padding-bottom: 1rem;
                    border-bottom: 1px dashed #dee2e6;
                    margin-bottom: 1rem;
                }

                .pedido-number {
                    color: #FF9D00;
                }

                .pedido-details-grid {
                    display: grid;
                    gap: 0.5rem;
                }

                .pedido-details-grid p {
                    margin: 0;
                    color: #555;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .status-badge {
                    padding: 0.25rem 0.75rem;
                    border-radius: 9999px;
                    color: white;
                    font-weight: 600;
                    font-size: 0.8rem;
                }

                /* LISTA DE PRODUTOS */
                .produtos-title {
                    margin-top: 2rem;
                    margin-bottom: 1rem;
                    color: #333;
                    font-size: 1.1rem;
                    border-left: 4px solid #FF9D00;
                    padding-left: 0.75rem;
                }

                .produtos-lista {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .produto-item {
                    border: 1px solid #e9ecef;
                    padding: 1.25rem;
                    border-radius: 0.75rem;
                    background-color: white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                    transition: transform 0.2s;
                }

                .produto-item:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                }

                .produto-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    padding-bottom: 0.75rem;
                    margin-bottom: 0.75rem;
                    border-bottom: 1px solid #f8f9fa;
                    gap: 1rem;
                }

                .produto-nome {
                    font-weight: 600;
                    color: #1A1A1A;
                    font-size: 1rem;
                    flex: 1;
                }

                .produto-status-badge {
                    padding: 0.35rem 0.8rem;
                    border-radius: 9999px;
                    color: white;
                    font-weight: 600;
                    font-size: 0.75rem;
                    white-space: nowrap;
                }

                .produto-detalhes p {
                    margin: 0.4rem 0;
                    color: #666;
                    font-size: 0.9rem;
                    display: flex;
                    justify-content: space-between;
                }

                /* RESPONSIVIDADE */
                @media (max-width: 768px) {
                    .page-container {
                        padding-top: 4.5rem;
                    }

                    .main-content-card {
                        padding: 1.5rem;
                        margin: 1rem 0;
                        border-radius: 1rem;
                    }

                    .title {
                        font-size: 1.8rem;
                    }

                    .input-group {
                        flex-direction: column;
                    }

                    .search-button {
                        width: 100%;
                    }

                    .produto-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.5rem;
                    }

                    .produto-status-badge {
                        align-self: flex-start;
                    }

                    .pedido-details-grid p {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.25rem;
                    }

                    .produto-detalhes p {
                        flex-direction: column;
                        gap: 0.25rem;
                    }

                    .user-info-card {
                        max-width: 100%;
                    }
                }

                @media (max-width: 480px) {
                    .main-content-card {
                        padding: 1rem;
                        margin: 0.5rem 0;
                    }

                    .title {
                        font-size: 1.5rem;
                    }

                    .resultado-card {
                        padding: 1rem;
                    }

                    .produto-item {
                        padding: 1rem;
                    }

                    .produto-nome {
                        font-size: 0.9rem;
                    }

                    .produto-status-badge {
                        font-size: 0.7rem;
                        padding: 0.3rem 0.6rem;
                    }
                }
            `}</style>
        </>
    );
}

export default RastrearPedido;