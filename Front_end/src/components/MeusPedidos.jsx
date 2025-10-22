import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext.jsx'; // 👈 IMPORTAR O CONTEXT
import Navbar from '../components/Navbar'; 

const MeusPedidos = () => {
    const navigate = useNavigate(); 
    const { user } = useAuth(); // 👈 PEGAR O USUÁRIO DO CONTEXT
    
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Mapeamento de status para cores
    const statusColors = {
        CONCLUIDO: '#22C55E',
        PENDENTE: '#FF9D00',
        CANCELADO: '#DC3545',
    };

    useEffect(() => {
        const fetchPedidos = async () => {
            // 👈 VERIFICAR SE USUÁRIO ESTÁ LOGADO
            if (!user || !user.id) {
                setError('Usuário não logado');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            try {
                // 👈 USAR O ID DO USUÁRIO LOGADO
                const response = await fetch(`http://localhost:3001/api/orders/cliente/${user.id}`);

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `Erro HTTP ${response.status}: Falha ao buscar pedidos.`);
                }

                const data = await response.json();
                
                // O Backend retorna um array de pedidos
                setPedidos(data.pedidos || []); // 👈 GARANTIR QUE É UM ARRAY
                
            } catch (err) {
                console.error('Erro ao buscar pedidos:', err);
                setError(err.message || 'Erro interno do servidor ao buscar pedidos.');
            } finally {
                setLoading(false);
            }
        };

        fetchPedidos();
    }, [user]); // 👈 ADICIONAR user COMO DEPENDÊNCIA

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

    // 👈 REDIRECIONAR SE NÃO ESTIVER LOGADO
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
            
            <div className="page-container" style={{paddingTop: '6rem'}}> 
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
                                
                                <button 
                                    className="rastrear-button"
                                    onClick={() => handleRastrearPedido(pedido.pedido_id)}
                                >
                                    Rastrear Detalhes »
                                </button>
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