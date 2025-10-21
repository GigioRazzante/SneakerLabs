import React, { useState, useEffect } from 'react'; // Adicionado useEffect
import { useParams } from 'react-router-dom'; // Adicionado useParams
import Navbar from '../components/Navbar'; 


// ⚠️ ATENÇÃO: Verifique se esta URL corresponde à porta do seu backend (server.js)
const BACKEND_URL = 'http://localhost:3001'; 

// Função auxiliar para formatar a data de exibição
const formatarData = (dataString) => {
    try {
        // '2025-10-21 14:57:01.63622-03' -> transforma em '21/10/2025'
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

function RastrearPedido() {
    // 🚨 NOVO: Obtém o pedidoId da URL (assumindo que a rota é /rastrear-pedido/:pedidoId)
    const { pedidoId: pedidoIdParam } = useParams();
    
    // 🚨 AJUSTE: Usa o ID da URL se ele existir, senão começa vazio para permitir busca manual
    const [pedidoIdInput, setPedidoIdInput] = useState(pedidoIdParam || ''); 
    
    // Estado para armazenar os dados de status retornados pela API
    const [statusData, setStatusData] = useState(null);
    
    // 🚨 AJUSTE: Inicia o loading se um ID foi passado pela URL
    const [loading, setLoading] = useState(!!pedidoIdParam); 
    
    // Estado para exibir mensagens de erro
    const [error, setError] = useState('');

    /**
     * Função auxiliar para formatar a exibição do status com cores.
     */
    const formatStatus = (status) => {
        switch (status) {
            case 'PENDENTE':
                return { text: 'Aguardando Produção', color: '#FF9D00' }; // Laranja
            case 'CONCLUIDO':
                return { text: 'Pronto para Retirada (Concluído)', color: '#28A745' }; // Verde
            case 'FILA':
                return { text: 'Em Fila de Montagem', color: '#007BFF' }; // Azul (Mais ativo que amarelo)
            case 'PRONTO':
                return { text: 'Produto Montado e no Slot', color: '#20C997' }; // Verde Água (Finalizado, mas não o pedido geral)
            case 'FALHA_ENVIO':
                return { text: 'Falha no Envio à Produção', color: '#DC3545' }; // Vermelho
            default:
                return { text: status, color: '#6C757D' };
        }
    };

    /**
     * Função para buscar os dados de status do pedido no Backend.
     */
    // 🚨 AJUSTE: aceita um ID opcional para ser chamada pelo useEffect
    const handleSearch = async (e) => {
        if (e) {
            e.preventDefault();
        }
        
        // Determina o ID a ser buscado (do input ou do parâmetro inicial)
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
            // Chama o novo endpoint: /api/orders/:pedidoId/status
            const response = await fetch(`${BACKEND_URL}/api/orders/${pedidoId}/status`);
            
            if (response.status === 404) {
                setError(`Pedido #${pedidoId} não encontrado no sistema.`);
                return;
            }

            if (!response.ok) {
                throw new Error('Erro ao conectar com o serviço de rastreio.');
            }

            const data = await response.json();
            setStatusData(data); // Salva os dados
            console.log("Dados do Rastreio recebidos:", data); // Log para debug

        } catch (err) {
            console.error(err);
            setError(`Falha na busca: ${err.message}. Verifique se o Backend está rodando.`);
        } finally {
            setLoading(false);
        }
    };
    
    // 🚨 NOVO: useEffect para buscar automaticamente se o ID estiver na URL
    useEffect(() => {
        // Se o parâmetro pedidoIdParam tiver um valor (vindo da URL), aciona a busca.
        if (pedidoIdParam) {
            handleSearch();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pedidoIdParam]); // Roda quando o componente é montado ou o parâmetro da URL muda
    
    // Auxiliar para extrair a parte mais relevante da config do produto
    const getProdutoTitle = (config) => {
        // Exemplo: "Skate / Camurça / EVA / Preto / Cadarço colorido"
        const parts = config.split('/');
        if (parts.length >= 2) {
            return `${parts[0].trim()} - Material: ${parts[1].trim()}`;
        }
        return config; 
    }

    return (
        <>
            <Navbar />
            <div className="page-container" style={{paddingTop: '6rem'}}> 
                <div className="main-content-card" style={{maxWidth: '900px', padding: '2rem 1.5rem'}}>
                    <h2 style={{ textAlign: 'center', color: '#1A1A1A', fontSize: '1.8rem' }}>🚚 Acompanhar Pedido</h2>
                    <p style={{ textAlign: 'center', color: '#666', marginBottom: '1.5rem' }}>Digite o ID do pedido para rastrear o status de produção.</p>
                    
                    {/* Formulário de Busca */}
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

                    {/* Mensagem de Erro */}
                    {error && <p className="error-message">{error}</p>}

                    {/* Resultado do Rastreio */}
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
           
            
            {/* Estilos CSS Embedidos */}
            <style>{`
                .main-content-card {
                    margin: 0 auto;
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