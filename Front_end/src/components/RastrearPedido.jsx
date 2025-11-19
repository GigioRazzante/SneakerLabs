import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'; 
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext.jsx';
import EditarProdutoModal from '../components/EditarProdutoModal';
import ConfirmarRemocaoModal from '../components/ConfirmarRemocaoModal';

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
        case 'ENTREGUE':
            return { text: 'Entregue', color: '#6F42C1' };
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
    const { codigoRastreio: codigoRastreioParam } = useParams(); // 🎯 MUDANÇA: agora usa código de rastreio
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [codigoRastreioInput, setCodigoRastreioInput] = useState(codigoRastreioParam || ''); // 🎯 MUDANÇA
    const [statusData, setStatusData] = useState(null);
    const [loading, setLoading] = useState(!!codigoRastreioParam);
    const [error, setError] = useState('');
    
    // Estados para modais de edição/remoção
    const [modalEditarAberto, setModalEditarAberto] = useState(false);
    const [modalRemoverAberto, setModalRemoverAberto] = useState(false);
    const [produtoSelecionado, setProdutoSelecionado] = useState(null);

    useEffect(() => {
        console.log('🔐 Usuário no RastrearPedido:', user);
        console.log('📦 Código de Rastreio da URL:', codigoRastreioParam);
    }, [user, codigoRastreioParam]);

    const handleSearch = async (e) => {
        if (e) {
            e.preventDefault();
        }
        
        const currentCodigoRastreio = e ? codigoRastreioInput : codigoRastreioParam;

        if (!currentCodigoRastreio) {
            setError('Por favor, digite o Código de Rastreio.');
            setStatusData(null);
            return;
        }

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

            console.log(`🔍 Buscando pedido por código: ${currentCodigoRastreio} para cliente ${user.id}`);

            // 🎯 MUDANÇA: Nova rota sem ID
            const response = await fetch(`${BACKEND_URL}/api/orders/rastreio/${currentCodigoRastreio}`, {
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
                setError(`Código de rastreio "${currentCodigoRastreio}" não encontrado no sistema.`);
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
        if (codigoRastreioParam && user && user.id) {
            console.log('🔄 Buscando automaticamente...');
            handleSearch();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [codigoRastreioParam, user]);

    // 🎯 FUNÇÕES PARA EDIÇÃO/REMOÇÃO
    const abrirModalEditar = (produto, produtoIndex) => {
        const configParts = produto.configuracao?.split(' / ') || [];
        const produtoCompleto = {
            id: produto.id || `produto-${produtoIndex}`,
            passo_um: configParts[0]?.trim() || '',
            passo_dois: configParts[1]?.trim() || '',
            passo_tres: configParts[2]?.trim() || '',
            passo_quatro: configParts[3]?.trim() || '',
            passo_cinco: configParts[4]?.trim() || '',
            status: produto.status,
            rastreioId: produto.rastreioId
        };
        
        setProdutoSelecionado(produtoCompleto);
        setModalEditarAberto(true);
    };

    const abrirModalRemover = (produto, produtoIndex) => {
        const configParts = produto.configuracao?.split(' / ') || [];
        const produtoCompleto = {
            id: produto.id || `produto-${produtoIndex}`,
            passo_um: configParts[0]?.trim() || '',
            passo_dois: configParts[1]?.trim() || '',
            passo_quatro: configParts[3]?.trim() || '',
            status: produto.status
        };
        
        setProdutoSelecionado(produtoCompleto);
        setModalRemoverAberto(true);
    };

    // 🎯 FUNÇÃO CHAMADA APÓS EDIÇÃO BEM-SUCEDIDA
    const handleProdutoEditado = (produtoAtualizado, novoValorTotal) => {
        console.log('✅ Produto editado com sucesso:', produtoAtualizado);
        
        if (statusData && statusData.produtos) {
            setStatusData(prev => ({
                ...prev,
                produtos: prev.produtos.map(p => 
                    p.id === produtoAtualizado.id ? { 
                        ...p, 
                        configuracao: `${produtoAtualizado.passo_um} / ${produtoAtualizado.passo_dois} / ${produtoAtualizado.passo_tres} / ${produtoAtualizado.passo_quatro} / ${produtoAtualizado.passo_cinco}`
                    } : p
                )
            }));
        }
        
        setModalEditarAberto(false);
        handleSearch(); // Recarregar dados
    };

    // 🎯 FUNÇÃO CHAMADA APÓS REMOÇÃO BEM-SUCEDIDA
    const handleProdutoRemovido = (resultado) => {
        console.log('✅ Produto removido com sucesso:', resultado);
        
        if (statusData && statusData.produtos) {
            const novosProdutos = statusData.produtos.filter(p => p.id !== produtoSelecionado.id);
            
            setStatusData(prev => ({
                ...prev,
                produtos: novosProdutos
            }));
            
            if (novosProdutos.length === 0) {
                alert('Todos os produtos foram removidos. O pedido foi cancelado.');
                navigate('/meus-pedidos');
            }
        }
        
        setModalRemoverAberto(false);
    };

    // 🎯 FUNÇÃO PARA CONFIRMAR ENTREGA
    const handleConfirmarEntrega = async () => {
        if (!statusData || !statusData.pedidoId) return;

        try {
            const response = await fetch(`${BACKEND_URL}/api/entrega/confirmar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    pedidoId: statusData.pedidoId
                })
            });

            if (!response.ok) {
                throw new Error('Erro ao confirmar entrega');
            }

            const data = await response.json();
            alert('✅ Entrega confirmada com sucesso! O slot foi liberado.');
            
            setStatusData(prev => ({
                ...prev,
                statusGeral: 'ENTREGUE'
            }));

        } catch (error) {
            console.error('❌ Erro ao confirmar entrega:', error);
            alert('Erro ao confirmar entrega: ' + error.message);
        }
    };

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
                    <div className="card-header-bar"></div>
                    
                    <div className="title-section">
                        <h2 className="title">🚚 Acompanhar Pedido</h2>
                        <p className="subtitle">Digite o código de rastreio para acompanhar o status de produção.</p> {/* 🎯 MUDANÇA */}
                        
                        {/* Informações do usuário */}
                        <div className="user-info-card">
                            <p><strong>Usuário logado:</strong> {user.nome_usuario} (ID: {user.id})</p>
                            <p><strong>Código a ser rastreado:</strong> {codigoRastreioParam || 'Nenhum'}</p> {/* 🎯 MUDANÇA */}
                        </div>
                    </div>

                    {/* Formulário de busca */}
                    <form onSubmit={handleSearch} className="search-form">
                        <div className="input-group">
                            <input 
                                type="text" 
                                placeholder="Código de Rastreio (ex: SIM-123456789)" 
                                value={codigoRastreioInput} 
                                onChange={(e) => setCodigoRastreioInput(e.target.value)} 
                                disabled={loading}
                                className="search-input"
                            />
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="search-button"
                            >
                                {loading ? '🔍 Buscando...' : '🔍 Rastrear Pedido'} 
                            </button>
                        </div>
                    </form>

                    {/* Opções alternativas */}
                    <div className="search-options">
                        <button 
                            onClick={() => navigate('/meus-pedidos')}
                            className="alternative-button"
                        >
                            📋 Ver Meus Pedidos
                        </button>
                    </div>

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
                                    <p><strong>Código de Rastreio:</strong> {statusData.codigoRastreio}</p> {/* 🎯 NOVO */}
                                    <p><strong>Slot de Expedição:</strong> 
                                        {statusData.slotExpedicao 
                                            ? <span className="status-badge" style={{ backgroundColor: '#28A745' }}>
                                                Slot {statusData.slotExpedicao.id} - {statusData.slotExpedicao.status}
                                              </span>
                                            : <span className="status-badge" style={{ backgroundColor: '#6C757D' }}>
                                                Não alocado
                                              </span>
                                        }
                                    </p>
                                </div>
                            </div>

                            <h4 className="produtos-title">Itens de Produção ({statusData.produtos?.length || 0})</h4>
                            
                            <div className="produtos-lista">
                                {statusData.produtos && statusData.produtos.length > 0 ? (
                                    statusData.produtos.map((produto, index) => (
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
                                                <p><strong>Status:</strong> {formatStatus(produto.status).text}</p>
                                            </div>

                                            {/* 🎯 BOTÕES DE EDIÇÃO/REMOÇÃO */}
                                            {statusData.statusGeral !== 'CONCLUIDO' && statusData.statusGeral !== 'ENTREGUE' && (
                                                <div className="produto-actions">
                                                    <button 
                                                        className="edit-button"
                                                        onClick={() => abrirModalEditar(produto, index)}
                                                    >
                                                        ✏️ Editar
                                                    </button>
                                                    <button 
                                                        className="delete-button"
                                                        onClick={() => abrirModalRemover(produto, index)}
                                                    >
                                                        🗑️ Remover
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-products">Nenhum produto encontrado neste pedido.</p>
                                )}
                            </div>

                            {/* 🎯 BOTÃO DE CONFIRMAR ENTREGA */}
                            {statusData.statusGeral === 'CONCLUIDO' && (
                                <div className="entrega-section">
                                    <button 
                                        className="confirmar-entrega-button"
                                        onClick={handleConfirmarEntrega}
                                    >
                                        ✅ Confirmar Entrega e Liberar Slot
                                    </button>
                                    <p className="entrega-info">
                                        Ao confirmar a entrega, o slot de expedição será liberado para novos pedidos.
                                    </p>
                                </div>
                            )}

                            {/* Botão para voltar */}
                            <div className="action-buttons">
                                <button 
                                    className="back-button"
                                    onClick={() => navigate('/meus-pedidos')}
                                >
                                    ← Voltar para Meus Pedidos
                                </button>
                                
                                <button 
                                    className="rastrear-button"
                                    onClick={() => navigate(`/rastrear-pedido/${statusData.codigoRastreio}`)} 
                                >
                                    🔄 Atualizar Status
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Footer />

            {/* 🎯 MODAIS DE EDIÇÃO/REMOÇÃO */}
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
                /* ESTILOS GLOBAIS */
                :root {
                    --laranja-vibrante: #FF9D00;
                    --preto: #000000;
                    --navbar-height: 5rem;
                }
                
                html { overflow-x: hidden; }
                body, html, #root {
                    margin: 0;
                    padding: 0;
                    width: 100%;
                    min-height: 100vh;
                    overflow-x: hidden;
                }

                .page-container {
                    padding-top: var(--navbar-height); 
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
                    margin-bottom: 1rem;
                }

                .search-options {
                    margin-bottom: 2rem;
                    text-align: center;
                }

                .alternative-button {
                    background: #6c757d;
                    color: white;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 0.5rem;
                    cursor: pointer;
                    font-size: 0.9rem;
                }

                .alternative-button:hover {
                    background: #545b62;
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

                /* 🎯 BOTÕES DE AÇÃO DOS PRODUTOS */
                .produto-actions {
                    display: flex;
                    gap: 0.5rem;
                    margin-top: 1rem;
                    padding-top: 0.75rem;
                    border-top: 1px solid #f8f9fa;
                }

                .edit-button {
                    background: #007bff;
                    color: white;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 0.5rem;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: background 0.3s;
                    flex: 1;
                }

                .edit-button:hover {
                    background: #0056b3;
                }

                .delete-button {
                    background: #dc3545;
                    color: white;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 0.5rem;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: background 0.3s;
                    flex: 1;
                }

                .delete-button:hover {
                    background: #c82333;
                }

                /* 🎯 SEÇÃO DE ENTREGA */
                .entrega-section {
                    margin-top: 2rem;
                    padding: 1.5rem;
                    background: #e8f5e8;
                    border-radius: 0.75rem;
                    border: 2px solid #28a745;
                    text-align: center;
                }

                .confirmar-entrega-button {
                    background: #28a745;
                    color: white;
                    border: none;
                    padding: 1rem 2rem;
                    border-radius: 0.75rem;
                    font-size: 1.1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.3s;
                    margin-bottom: 1rem;
                }

                .confirmar-entrega-button:hover {
                    background: #218838;
                }

                .entrega-info {
                    color: #155724;
                    font-size: 0.9rem;
                    margin: 0;
                }

                /* BOTÕES DE AÇÃO GERAIS */
                .action-buttons {
                    display: flex;
                    gap: 1rem;
                    margin-top: 2rem;
                    justify-content: center;
                    flex-wrap: wrap;
                }

                .back-button {
                    background: #6c757d;
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 0.5rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.3s;
                }

                .back-button:hover {
                    background: #545b62;
                }

                .rastrear-button {
                    background: #FF9D00;
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 0.5rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.3s;
                }

                .rastrear-button:hover {
                    background: #e68a00;
                }

                .no-products {
                    text-align: center;
                    color: #666;
                    font-style: italic;
                    padding: 2rem;
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

                    .produto-actions {
                        flex-direction: column;
                    }

                    .action-buttons {
                        flex-direction: column;
                        align-items: center;
                    }

                    .back-button,
                    .rastrear-button {
                        width: 100%;
                        max-width: 300px;
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

                    .confirmar-entrega-button {
                        padding: 0.75rem 1rem;
                        font-size: 1rem;
                    }
                }
            `}</style>
        </>
    );
}

export default RastrearPedido;