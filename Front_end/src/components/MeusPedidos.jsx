import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar'; 

const MeusPedidos = () => {
    const navigate = useNavigate(); 
    const { user } = useAuth();
    
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Mapeamento de status para cores
    const statusColors = {
        CONCLUIDO: '#22C55E',
        PENDENTE: '#FF9D00',
        CANCELADO: '#DC3545',
        ENTREGUE: '#6F42C1',
    };

    useEffect(() => {
        const fetchPedidos = async () => {
            if (!user || !user.id) {
                setError('Usuário não logado');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`http://localhost:3001/api/orders/cliente/${user.id}`);

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `Erro HTTP ${response.status}: Falha ao buscar pedidos.`);
                }

                const data = await response.json();
                setPedidos(data.pedidos || []);
                
            } catch (err) {
                console.error('Erro ao buscar pedidos:', err);
                setError(err.message || 'Erro interno do servidor ao buscar pedidos.');
            } finally {
                setLoading(false);
            }
        };

        fetchPedidos();
    }, [user]);

    const formatarData = (dataString) => {
        try {
            const dataObj = new Date(dataString);
            return dataObj.toLocaleDateString('pt-BR');
        } catch {
            return dataString;
        }
    };

    const handleRastrearPedido = (pedidoId) => {
        navigate(`/rastrear-pedido/${pedidoId}`);
    };

    // 🎯 FUNÇÃO PARA CONFIRMAR ENTREGA
    const handleConfirmarEntrega = async (pedidoId) => {
        if (!pedidoId) return;

        try {
            const response = await fetch(`http://localhost:3001/api/entrega/confirmar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    pedidoId: pedidoId
                })
            });

            if (!response.ok) {
                throw new Error('Erro ao confirmar entrega');
            }

            const data = await response.json();
            alert('✅ Entrega confirmada com sucesso! O slot foi liberado.');
            
            // Atualizar status localmente
            setPedidos(prev => prev.map(pedido => 
                pedido.pedido_id === pedidoId 
                    ? { ...pedido, status_geral: 'ENTREGUE' }
                    : pedido
            ));

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
                height: '50vh',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <p>Você precisa estar logado para ver seus pedidos.</p>
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
                <div className="main-content-card" style={{maxWidth: '800px', padding: '2rem 1.5rem'}}>
                    <div className="title-section">
                        <h2 className="title">Histórico de Pedidos</h2>
                        <p className="subtitle">Seus pedidos personalizados e status de produção.</p>
                        <p className="user-info" style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                            Cliente: {user.nome_usuario} (ID: {user.id})
                        </p>
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
                            Nenhum pedido encontrado para sua conta.
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
                                    <p>Valor Total: <strong className="total-price">R$ {pedido.valor_total ? pedido.valor_total.toFixed(2).replace('.', ',') : 'N/A'}</strong></p>
                                </div>
                                
                                <div className="pedido-actions">
                                    <button 
                                        className="rastrear-button"
                                        onClick={() => handleRastrearPedido(pedido.pedido_id)}
                                    >
                                        Rastrear Detalhes »
                                    </button>
                                    
                                    {/* 🎯 BOTÃO DE CONFIRMAR ENTREGA - Só mostrar se pedido estiver CONCLUIDO */}
                                    {pedido.status_geral === 'CONCLUIDO' && (
                                        <button 
                                            className="confirmar-entrega-button"
                                            onClick={() => handleConfirmarEntrega(pedido.pedido_id)}
                                        >
                                            ✅ Confirmar Entrega
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <style>{`
                .title-section .title {
                    color: #1A1A1A;
                    font-size: 2rem;
                    font-weight: bold;
                    margin-bottom: 0.5rem;
                }
                
                .title-section .subtitle {
                    color: #666;
                    font-size: 1rem;
                }

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
                
                /* 🎯 CONTAINER PARA OS BOTÕES */
                .pedido-actions {
                    display: flex;
                    gap: 0.75rem;
                    margin-top: 1rem;
                    flex-wrap: wrap;
                }
                
                .rastrear-button {
                    flex: 1;
                    background-color: var(--azul-selecao, #00BFFF);
                    color: white;
                    font-weight: 600;
                    padding: 0.75rem;
                    border: none;
                    border-radius: 0.5rem;
                    cursor: pointer;
                    transition: background-color 0.3s;
                    min-width: 150px;
                }
                .rastrear-button:hover {
                    background-color: #0099cc;
                }
                
                /* 🎯 BOTÃO DE CONFIRMAR ENTREGA */
                .confirmar-entrega-button {
                    flex: 1;
                    background-color: #28a745;
                    color: white;
                    font-weight: 600;
                    padding: 0.75rem;
                    border: none;
                    border-radius: 0.5rem;
                    cursor: pointer;
                    transition: background-color 0.3s;
                    min-width: 150px;
                }
                .confirmar-entrega-button:hover {
                    background-color: #218838;
                }
                
                /* RESPONSIVIDADE */
                @media (max-width: 768px) {
                    .pedido-actions {
                        flex-direction: column;
                    }
                    
                    .rastrear-button,
                    .confirmar-entrega-button {
                        width: 100%;
                    }
                    
                    .pedido-header-info {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.5rem;
                    }
                    
                    .pedido-details p {
                        flex-direction: column;
                        gap: 0.25rem;
                    }
                }
                
                @media (max-width: 480px) {
                    .pedido-card {
                        padding: 1rem;
                    }
                    
                    .pedido-id {
                        font-size: 1.1rem;
                    }
                    
                    .rastrear-button,
                    .confirmar-entrega-button {
                        padding: 0.6rem;
                        font-size: 0.9rem;
                    }
                }
            `}</style>
        </>
    );
}

export default MeusPedidos;