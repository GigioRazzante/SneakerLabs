import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'; // ADICIONE
import Footer from '../components/Footer'; // ADICIONE
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import EditarProdutoModal from '../components/EditarProdutoModal';
import ConfirmarRemocaoModal from '../components/ConfirmarRemocaoModal';

const BACKEND_URL = 'http://localhost:3001'; 

// ✅ FUNÇÕES AUXILIARES SIMPLIFICADAS
const formatarData = (dataString) => {
    if (!dataString) return 'Data não disponível';
    return new Date(dataString).toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const formatStatus = (status) => {
    const statusMap = {
        'PENDENTE': { text: 'Aguardando Produção', color: '#FF9D00' },
        'CONCLUIDO': { text: 'Pronto para Retirada', color: '#28A745' },
        'FILA': { text: 'Em Fila de Montagem', color: '#007BFF' },
        'PRONTO': { text: 'Produto Montado', color: '#20C997' },
        'FALHA_ENVIO': { text: 'Falha no Envio', color: '#DC3545' },
        'ENTREGUE': { text: 'Entregue', color: '#6F42C1' },
        'SIMULADO': { text: 'Pedido Simulado', color: '#6C757D' }
    };
    return statusMap[status] || { text: status, color: '#6C757D' };
};

// ✅ FUNÇÃO CORRIGIDA - Agora lida com undefined
const getProdutoTitle = (config) => {
    if (!config || typeof config !== 'string') return 'Sneaker Personalizado';
    
    const parts = config.split('/');
    if (parts.length >= 2) {
        return `${parts[0].trim()} - Material: ${parts[1].trim()}`;
    }
    return config || 'Sneaker Personalizado';
};

function RastrearPedido() {
    const { codigoRastreio: codigoRastreioParam } = useParams();
    const { user } = useAuth();
    const { primaryColor } = useTheme();
    const navigate = useNavigate();
    
    const [codigoRastreioInput, setCodigoRastreioInput] = useState(codigoRastreioParam || '');
    const [statusData, setStatusData] = useState(null);
    const [loading, setLoading] = useState(!!codigoRastreioParam);
    const [error, setError] = useState('');
    
    // Estados para modais
    const [modalEditarAberto, setModalEditarAberto] = useState(false);
    const [modalRemoverAberto, setModalRemoverAberto] = useState(false);
    const [produtoSelecionado, setProdutoSelecionado] = useState(null);

    useEffect(() => {
        console.log('🔐 Usuário:', user?.nome_usuario);
        console.log('📦 Código da URL:', codigoRastreioParam);
    }, [user, codigoRastreioParam]);

    const buscarPedido = async (codigo) => {
        if (!codigo || !user?.id) {
            setError('Informações incompletas para busca.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const headers = {
                'Content-Type': 'application/json',
                'x-client-id': user.id.toString()
            };

            const response = await fetch(`${BACKEND_URL}/api/orders/rastreio/${codigo}`, { headers });
            
            if (response.status === 404) {
                setError(`Código "${codigo}" não encontrado.`);
                return;
            }
            
            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setStatusData(data);
            
        } catch (err) {
            console.error('❌ Erro:', err);
            setError(`Falha na busca: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e?.preventDefault();
        buscarPedido(codigoRastreioInput || codigoRastreioParam);
    };
    
    useEffect(() => {
        if (codigoRastreioParam && user?.id) {
            buscarPedido(codigoRastreioParam);
        }
    }, [codigoRastreioParam, user]);

    // 🎯 FUNÇÕES DE EDIÇÃO/REMOÇÃO
    const abrirModalEditar = (produto, index) => {
        const configParts = produto.configuracao?.split(' / ') || [];
        setProdutoSelecionado({
            id: produto.id || `produto-${index}`,
            passo_um: configParts[0]?.trim() || '',
            passo_dois: configParts[1]?.trim() || '',
            passo_tres: configParts[2]?.trim() || '',
            passo_quatro: configParts[3]?.trim() || '',
            passo_cinco: configParts[4]?.trim() || '',
            status: produto.status,
            rastreioId: produto.rastreioId
        });
        setModalEditarAberto(true);
    };

    const abrirModalRemover = (produto, index) => {
        setProdutoSelecionado({
            id: produto.id || `produto-${index}`,
            descricao: produto.configuracao?.split(' / ')[0] || 'Produto'
        });
        setModalRemoverAberto(true);
    };

    const handleProdutoEditado = () => {
        setModalEditarAberto(false);
        buscarPedido(codigoRastreioInput || codigoRastreioParam);
    };

    const handleProdutoRemovido = () => {
        setModalRemoverAberto(false);
        buscarPedido(codigoRastreioInput || codigoRastreioParam);
    };

    const handleConfirmarEntrega = async () => {
        if (!statusData?.pedidoId) return;

        try {
            const response = await fetch(`${BACKEND_URL}/api/entrega/confirmar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pedidoId: statusData.pedidoId })
            });

            if (response.ok) {
                alert('✅ Entrega confirmada!');
                setStatusData(prev => ({ ...prev, statusGeral: 'ENTREGUE' }));
            }
        } catch (error) {
            alert('Erro ao confirmar entrega');
        }
    };

    if (!user) {
        return (
            <div className="login-required">
                <p style={{ color: '#000000' }}>Você precisa estar logado para rastrear pedidos.</p>
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
                        background-color: #f8f9fa;
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
            <Navbar /> {/* NAVBAR ADICIONADO */}
            
            <div className="page-container">
                <div className="main-content-card">
                    <div className="card-header-bar" style={{ backgroundColor: primaryColor }}></div>
                    
                    <div className="title-section">
                        <h1 className="title">🚚 Acompanhar Pedido</h1>
                        <p className="subtitle" style={{ color: '#666' }}>Digite o código de rastreio para acompanhar o status de produção.</p>
                        
                        <div className="user-info-card">
                            <p style={{ color: '#000000' }}><strong>Usuário:</strong> {user.nome_usuario}</p>
                            <p style={{ color: '#000000' }}><strong>Código:</strong> {codigoRastreioParam || 'Nenhum'}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="search-form">
                        <div className="input-group">
                            <input 
                                type="text" 
                                placeholder="Código de Rastreio (ex: SIM-123456789)" 
                                value={codigoRastreioInput} 
                                onChange={(e) => setCodigoRastreioInput(e.target.value)} 
                                disabled={loading}
                                className="search-input"
                                style={{ color: '#000000' }}
                            />
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="search-button"
                                style={{ backgroundColor: primaryColor }}
                            >
                                {loading ? '🔍 Buscando...' : '🔍 Rastrear'} 
                            </button>
                        </div>
                    </form>

                    {error && <div className="error-message">{error}</div>}

                    {statusData && (
                        <div className="resultado-card">
                            <div className="pedido-geral-info">
                                <h2 style={{ color: '#000000' }}>Pedido <span style={{ color: primaryColor }}>#{statusData.pedidoId}</span></h2>
                                <div className="pedido-details-grid">
                                    <div style={{ color: '#000000' }}><strong style={{ color: '#333' }}>Data:</strong> {formatarData(statusData.dataCriacao)}</div>
                                    <div style={{ color: '#000000' }}>
                                        <strong style={{ color: '#333' }}>Status:</strong> 
                                        <span className="status-badge" style={{ backgroundColor: formatStatus(statusData.statusGeral).color }}>
                                            {formatStatus(statusData.statusGeral).text}
                                        </span>
                                    </div>
                                    <div style={{ color: '#000000' }}><strong style={{ color: '#333' }}>Código:</strong> {statusData.codigoRastreio}</div>
                                </div>
                            </div>

                            <h3 style={{ color: '#333' }}>Itens de Produção ({statusData.produtos?.length || 0})</h3>
                            
                            <div className="produtos-lista">
                                {statusData.produtos?.length > 0 ? (
                                    statusData.produtos.map((produto, index) => (
                                        <div key={index} className="produto-item">
                                            <div className="produto-header">
                                                <span className="produto-nome" style={{ color: '#000000' }}>{getProdutoTitle(produto.configuracao)}</span>
                                                <span className="produto-status-badge" style={{ backgroundColor: formatStatus(produto.status).color }}>
                                                    {formatStatus(produto.status).text}
                                                </span>
                                            </div>
                                            
                                            <div className="produto-detalhes">
                                                <div style={{ color: '#000000' }}><strong style={{ color: '#333' }}>Rastreio ID:</strong> {produto.rastreioId || 'Aguardando'}</div>
                                            </div>

                                            {statusData.statusGeral !== 'CONCLUIDO' && statusData.statusGeral !== 'ENTREGUE' && (
                                                <div className="produto-actions">
                                                    <button className="edit-button" onClick={() => abrirModalEditar(produto, index)}>
                                                        ✏️ Editar
                                                    </button>
                                                    <button className="delete-button" onClick={() => abrirModalRemover(produto, index)}>
                                                        🗑️ Remover
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-products" style={{ color: '#000000' }}>Nenhum produto encontrado.</p>
                                )}
                            </div>

                            {statusData.statusGeral === 'CONCLUIDO' && (
                                <div className="entrega-section">
                                    <button className="confirmar-entrega-button" onClick={handleConfirmarEntrega}>
                                        ✅ Confirmar Entrega
                                    </button>
                                </div>
                            )}

                            <div className="action-buttons">
                                <button className="back-button" onClick={() => navigate('/perfil')} style={{ color: '#000000' }}>
                                    ← Voltar para Perfil
                                </button>
                                <button 
                                    className="rastrear-button"
                                    onClick={() => buscarPedido(statusData.codigoRastreio)}
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    🔄 Atualizar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Footer /> {/* FOOTER ADICIONADO */}

            {/* 🎯 MODAIS */}
            {modalEditarAberto && produtoSelecionado && (
                <EditarProdutoModal
                    produto={produtoSelecionado}
                    pedidoId={statusData?.pedidoId}
                    onSave={handleProdutoEditado}
                    onClose={() => setModalEditarAberto(false)}
                />
            )}

            {modalRemoverAberto && produtoSelecionado && (
                <ConfirmarRemocaoModal
                    produto={produtoSelecionado}
                    onConfirm={handleProdutoRemovido}
                    onCancel={() => setModalRemoverAberto(false)}
                />
            )}
            
            <style>{`
                :root {
                    --primary-color: ${primaryColor};
                }
                
                /* CONTAINER PRINCIPAL COM ESPAÇO PARA NAVBAR */
                .page-container {
                    padding-top: 5rem; /* Espaço para navbar */
                    padding-bottom: 2rem;
                    min-height: calc(100vh - 200px); /* Ajusta altura para footer */
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                    width: 100%;
                }
                
                .main-content-card {
                    width: 95%;
                    max-width: 900px;
                    background: white;
                    border-radius: 1.5rem;
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
                    padding: 2.5rem;
                    margin: 2rem auto;
                    position: relative;
                }

                .card-header-bar {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 8px;
                    border-top-left-radius: 1.5rem;
                    border-top-right-radius: 1.5rem;
                }

                .title-section {
                    text-align: center;
                    margin-bottom: 2.5rem;
                }

                .title {
                    font-size: 2.8rem;
                    font-weight: 800;
                    margin-bottom: 0.5rem;
                    background: linear-gradient(135deg, var(--primary-color) 0%, #ffb347 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .subtitle {
                    font-size: 1.1rem;
                    margin: 0 auto 2rem;
                    max-width: 600px;
                }

                .user-info-card {
                    background: rgba(0, 0, 0, 0.05);
                    border-radius: 1rem;
                    padding: 1.5rem;
                    max-width: 500px;
                    margin: 0 auto;
                }

                .search-form {
                    margin-bottom: 1.5rem;
                }

                .input-group {
                    display: flex;
                    gap: 1rem;
                    max-width: 600px;
                    margin: 0 auto;
                }

                .search-input {
                    flex: 1;
                    padding: 1rem 1.2rem;
                    border: 2px solid #f0f0f0;
                    border-radius: 1rem;
                    font-size: 1rem;
                    background: #fafafa;
                    transition: border 0.3s;
                    color: #000000 !important;
                }

                .search-input::placeholder {
                    color: #666;
                }

                .search-input:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    background: white;
                }

                .search-button {
                    padding: 1rem 2rem;
                    color: white;
                    border: none;
                    border-radius: 1rem;
                    font-weight: 700;
                    font-size: 1.1rem;
                    cursor: pointer;
                    transition: transform 0.3s;
                }

                .search-button:hover:not(:disabled) {
                    transform: translateY(-2px);
                }

                .error-message {
                    color: #DC3545;
                    text-align: center;
                    padding: 1rem;
                    background: #f8d7da;
                    border-radius: 1rem;
                    max-width: 600px;
                    margin: 1.5rem auto;
                }

                .resultado-card {
                    background: white;
                    border-radius: 1.5rem;
                    padding: 2rem;
                    margin-top: 2rem;
                    border: 2px solid #f8f9fa;
                }

                .pedido-details-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem;
                    margin-top: 1rem;
                }

                .status-badge {
                    padding: 0.5rem 1rem;
                    border-radius: 9999px;
                    color: white;
                    font-weight: 600;
                    font-size: 0.9rem;
                    display: inline-block;
                    margin-left: 0.5rem;
                }

                .produtos-lista {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    margin: 1.5rem 0;
                }

                .produto-item {
                    background: white;
                    border: 2px solid #f8f9fa;
                    border-radius: 1rem;
                    padding: 1.5rem;
                }

                .produto-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .produto-nome {
                    font-weight: 600;
                    font-size: 1.1rem;
                    color: #000000;
                }

                .produto-status-badge {
                    padding: 0.5rem 1rem;
                    border-radius: 9999px;
                    color: white;
                    font-weight: 600;
                }

                .produto-detalhes {
                    color: #000000;
                }

                .produto-actions {
                    display: flex;
                    gap: 1rem;
                    margin-top: 1rem;
                }

                .edit-button {
                    background: #007bff;
                    color: white;
                    border: none;
                    padding: 0.75rem;
                    border-radius: 0.75rem;
                    cursor: pointer;
                    flex: 1;
                    font-weight: 600;
                }

                .delete-button {
                    background: #dc3545;
                    color: white;
                    border: none;
                    padding: 0.75rem;
                    border-radius: 0.75rem;
                    cursor: pointer;
                    flex: 1;
                    font-weight: 600;
                }

                .entrega-section {
                    margin: 2rem 0;
                    text-align: center;
                }

                .confirmar-entrega-button {
                    background: #28a745;
                    color: white;
                    border: none;
                    padding: 1rem 2rem;
                    border-radius: 1rem;
                    font-size: 1.1rem;
                    font-weight: 700;
                    cursor: pointer;
                }

                .action-buttons {
                    display: flex;
                    gap: 1.5rem;
                    margin-top: 2rem;
                    justify-content: center;
                }

                .back-button {
                    padding: 1rem 2rem;
                    background: transparent;
                    color: #000000;
                    border: 2px solid #333;
                    border-radius: 1rem;
                    cursor: pointer;
                    font-weight: 600;
                }

                .back-button:hover {
                    background: #333;
                    color: white;
                }

                .rastrear-button {
                    padding: 1rem 2rem;
                    color: white;
                    border: none;
                    border-radius: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                }

                .centered-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    flex-direction: column;
                    gap: 1rem;
                }

                .action-button {
                    padding: 0.75rem 1.5rem;
                    color: white;
                    border: none;
                    border-radius: 0.5rem;
                    cursor: pointer;
                }

                .no-products {
                    text-align: center;
                    color: #000000;
                    font-style: italic;
                    padding: 2rem;
                }

                /* RESPONSIVO */
                @media (max-width: 768px) {
                    .page-container {
                        padding-top: 4.5rem; /* Ajuste para navbar mobile */
                        padding-bottom: 1rem;
                        min-height: calc(100vh - 180px);
                    }
                    
                    .main-content-card {
                        padding: 1.5rem;
                        margin: 1rem auto;
                    }
                    
                    .title {
                        font-size: 2rem;
                    }
                    
                    .input-group {
                        flex-direction: column;
                    }
                    
                    .pedido-details-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .produto-actions {
                        flex-direction: column;
                    }
                    
                    .action-buttons {
                        flex-direction: column;
                        align-items: center;
                    }
                    
                    .back-button, .rastrear-button {
                        width: 100%;
                        max-width: 300px;
                    }
                }

                @media (max-width: 480px) {
                    .main-content-card {
                        padding: 1rem;
                    }
                    
                    .title {
                        font-size: 1.8rem;
                    }
                    
                    .search-button, .confirmar-entrega-button {
                        width: 100%;
                    }
                }
            `}</style>
        </>
    );
}

export default RastrearPedido;