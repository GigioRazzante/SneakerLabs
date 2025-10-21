import React, { useState, useEffect } from 'react';
// 🚨 NOVO: Importe useNavigate do react-router-dom
import { useNavigate } from 'react-router-dom'; 
import Navbar from '../components/Navbar'; 


// Define o ID do cliente para buscar (deve ser o mesmo usado na criação do pedido)
const CLIENTE_ID = 1; 

const MeusPedidos = () => {
    // 🚨 NOVO: Inicialize o useNavigate
    const navigate = useNavigate(); 
    
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Mapeamento de status para cores (para uma melhor UX)
    const statusColors = {
        CONCLUIDO: '#22C55E', // Verde (var(--verde-confirmar))
        PENDENTE: '#FF9D00',  // Laranja (var(--laranja-vibrante))
        CANCELADO: '#DC3545', // Vermelho
    };

    useEffect(() => {
        const fetchPedidos = async () => {
            setLoading(true);
            setError(null);
            try {
                // Rota para buscar todos os pedidos de um cliente
                const response = await fetch(`http://localhost:3001/api/orders/cliente/${CLIENTE_ID}`);

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `Erro HTTP ${response.status}: Falha ao buscar pedidos.`);
                }

                const data = await response.json();
                
                // O Backend retorna um array de pedidos
                setPedidos(data.pedidos); 
                
            } catch (err) {
                console.error('Erro ao buscar pedidos:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPedidos();
    }, []); // A dependência vazia garante que roda apenas na montagem

    const formatarData = (dataString) => {
        // Assume que a data pode vir como '2025-10-21 14:57:01.63622-03'
        // Extrai apenas a data para exibição
        try {
            const dataObj = new Date(dataString);
            return dataObj.toLocaleDateString('pt-BR');
        } catch {
            return dataString; // Retorna o original se houver erro
        }
    };

    // 🚨 ALTERADO: Implementação real da navegação
    const handleRastrearPedido = (pedidoId) => {
        // Usa o hook navigate para mudar a rota, passando o ID
        navigate(`/rastrear-pedido/${pedidoId}`);
    };

    return (
        <>
            <Navbar />
            
            <div className="page-container" style={{paddingTop: '6rem'}}> 
                <div className="main-content-card" style={{maxWidth: '800px', padding: '2rem 1.5rem'}}>
                    <div className="title-section">
                        {/* ESTE É O TÍTULO QUE RECEBERÁ O NOVO ESTILO CSS */}
                        <h2 className="title">Histórico de Pedidos</h2>
                        <p className="subtitle">Seus pedidos personalizados e status de produção.</p>
                    </div>

                    {loading && <p style={{ textAlign: 'center' }}>Carregando pedidos...</p>}
                    
                    {error && (
                        <div style={{ color: '#DC3545', textAlign: 'center', border: '1px solid #DC3545', padding: '1rem', borderRadius: '0.5rem' }}>
                            <p>Erro: {error}</p>
                            <p>Verifique se o seu Backend (porta 3001) está rodando.</p>
                        </div>
                    )}
                    
                    {!loading && pedidos.length === 0 && !error && (
                        <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.1rem' }}>
                            Nenhum pedido encontrado para o Cliente ID {CLIENTE_ID}.
                        </p>
                    )}

                    <div className="pedidos-lista">
                        {pedidos.map(pedido => (
                            <div key={pedido.pedido_id} className="pedido-card">
                                <div className="pedido-header-info">
                                    <span className="pedido-id">Pedido #{pedido.pedido_id}</span>
                                    <span 
                                        className="pedido-status" 
                                        style={{ backgroundColor: statusColors[pedido.status_geral] || '#ccc' }}
                                    >
                                        {pedido.status_geral}
                                    </span>
                                </div>
                                
                                <div className="pedido-details">
                                    <p>Data do Pedido: <strong>{formatarData(pedido.data_criacao)}</strong></p>
                                    <p>Total de Itens: <strong>{pedido.total_produtos}</strong></p>
                                    {/* O toFixed está seguro agora, se você aplicou a correção do backend */}
                                    <p>Valor Total: <strong className="total-price">R$ {pedido.valor_total ? pedido.valor_total.toFixed(2).replace('.', ',') : 'N/A'}</strong></p>
                                </div>
                                
                                {/* Botão para ir para a tela de Rastreio DETALHADO */}
                                <button 
                                    className="rastrear-button"
                                    // 🚨 CHAMADA ATUALIZADA: Passa o ID para a função de navegação
                                    onClick={() => handleRastrearPedido(pedido.pedido_id)}
                                >
                                    Rastrear Detalhes »
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            
            
            
            {/* Estilos específicos para esta tela */}
            <style>{`
                /* NOVO ESTILO PARA CORRIGIR A COR DO TÍTULO */
                .title-section .title {
                    color: #1A1A1A; /* Cor do texto para preto (ou outra cor escura) */
                    font-size: 2rem;
                    font-weight: bold;
                    margin-bottom: 0.5rem;
                }
                
                .title-section .subtitle {
                    color: #666; /* Cor do subtítulo para legibilidade */
                    font-size: 1rem;
                }
                /* FIM DO NOVO ESTILO */

                .pedidos-lista {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    margin-top: 2rem;
                }
                .pedido-card {
                    padding: 1.5rem;
                    border: 1px solid #eee;
                    border-radius: 1rem;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
                    transition: transform 0.2s;
                }
                .pedido-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 6px 15px rgba(0,0,0,0.1);
                }
                .pedido-header-info {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px dashed #ddd;
                }
                .pedido-id {
                    font-size: 1.25rem;
                    font-weight: bold;
                    color: var(--laranja-vibrante, #FF9D00);
                }
                .pedido-status {
                    padding: 0.3rem 0.8rem;
                    border-radius: 9999px;
                    color: white;
                    font-weight: 600;
                    font-size: 0.85rem;
                }
                .pedido-details p {
                    margin: 0.3rem 0;
                    color: #555;
                    display: flex;
                    justify-content: space-between;
                }
                .rastrear-button {
                    display: block;
                    width: 100%;
                    background-color: var(--azul-selecao, #00BFFF);
                    color: white;
                    font-weight: 600;
                    padding: 0.75rem;
                    margin-top: 1rem;
                    border: none;
                    border-radius: 0.5rem;
                    cursor: pointer;
                    transition: background-color 0.3s;
                }
                .rastrear-button:hover {
                    background-color: #0099cc;
                }
            `}</style>
        </>
    );
}

export default MeusPedidos;