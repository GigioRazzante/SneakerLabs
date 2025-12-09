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
    };

    useEffect(() => {
        const fetchPedidos = async () => {
            if (!user?.id) {
                setError('Usuário não logado');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/api/orders/cliente/${user.id}/detalhado`);
                if (!response.ok) throw new Error('Falha ao buscar pedidos');
                
                const data = await response.json();
                setPedidos(data.pedidos || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPedidos();
    }, [user]);

    const formatarData = (dataString) => new Date(dataString).toLocaleDateString('pt-BR');

    const handleRastrearPedido = (pedido) => {
        const codigoRastreio = pedido.codigos_rastreio?.[0];
        codigoRastreio 
            ? navigate(`/rastrear-pedido/${codigoRastreio}`)
            : alert('Este pedido ainda não tem código de rastreio disponível.');
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
                pedido.pedido_id === pedidoId 
                    ? { ...pedido, status_geral: 'ENTREGUE' }
                    : pedido
            ));
        } catch (error) {
            alert('Erro ao confirmar entrega: ' + error.message);
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
                        <h1>Histórico de Pedidos</h1>
                        <p>Seus pedidos personalizados e status de produção.</p>
                        
                        <div className="user-info">
                            <p><strong>Cliente:</strong> {user.nome_usuario}</p>
                            <p><strong>ID:</strong> {user.id}</p>
                        </div>
                    </div>

                    {loading && <div className="loading">Carregando pedidos...</div>}
                    
                    {error && (
                        <div className="error">
                            <p><strong>Erro:</strong> {error}</p>
                            <p>Verifique se o seu Backend (porta 3001) está rodando.</p>
                        </div>
                    )}
                    
                    {!loading && !pedidos.length && !error && (
                        <div className="empty">
                            <p>Nenhum pedido encontrado para sua conta.</p>
                            <button 
                                onClick={() => navigate('/criar-sneaker')}
                                style={{ backgroundColor: primaryColor }}
                            >
                                🎨 Criar meu Primeiro Sneaker
                            </button>
                        </div>
                    )}

                    <div className="pedidos-list">
                        {pedidos.map(pedido => (
                            <div key={pedido.pedido_id} className="pedido">
                                <div className="pedido-header">
                                    <h3>Pedido #{pedido.pedido_id}</h3>
                                    <span className="status" style={{ backgroundColor: statusColors[pedido.status_geral] }}>
                                        {pedido.status_geral}
                                    </span>
                                </div>
                                
                                <div className="pedido-detalhes">
                                    <div className="detalhe">
                                        <strong>Data do Pedido:</strong>
                                        <span>{formatarData(pedido.data_criacao)}</span>
                                    </div>
                                    <div className="detalhe">
                                        <strong>Total de Itens:</strong>
                                        <span>{pedido.total_produtos}</span>
                                    </div>
                                    <div className="detalhe">
                                        <strong>Valor Total:</strong>
                                        <span className="valor">R$ {pedido.valor_total?.toFixed(2).replace('.', ',') || 'N/A'}</span>
                                    </div>
                                    
                                    {pedido.codigos_rastreio?.length > 0 && (
                                        <div className="detalhe">
                                            <strong>Códigos de Rastreio:</strong>
                                            <div className="codigos">
                                                {pedido.codigos_rastreio.map((codigo, index) => (
                                                    <span key={index} className="codigo">{codigo}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="acoes">
                                    <button 
                                        onClick={() => handleRastrearPedido(pedido)}
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        📦 Rastrear Detalhes
                                    </button>
                                    
                                    {pedido.status_geral === 'CONCLUIDO' && (
                                        <button onClick={() => handleConfirmarEntrega(pedido.pedido_id)}>
                                            ✅ Confirmar Entrega
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="footer-buttons">
                        <button onClick={() => navigate('/perfil')}>← Voltar para Perfil</button>
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
                }

                .user-info p {
                    margin: 0.5rem 0;
                }

                /* Estados */
                .loading, .error, .empty {
                    text-align: center;
                    padding: 2rem;
                    margin: 1.5rem 0;
                }

                .error {
                    color: var(--error);
                    background: #f8d7da;
                    border: 1px solid #f5c6cb;
                    border-radius: 1rem;
                }

                .empty {
                    background: #fafafa;
                    border: 2px dashed var(--gray);
                    border-radius: 1rem;
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
                    align-items: center;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 2px solid var(--gray);
                }

                .pedido-header h3 {
                    margin: 0;
                    color: var(--text);
                }

                .status {
                    padding: 0.5rem 1rem;
                    border-radius: 9999px;
                    color: white;
                    font-weight: 600;
                    text-transform: uppercase;
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
                }

                .detalhe strong { color: var(--text-light); }
                .detalhe span { color: var(--text); font-weight: 500; }
                .valor { color: var(--success); font-weight: 700; font-size: 1.2rem; }

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
                }

                /* Botões */
                .acoes {
                    display: flex;
                    gap: 1rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid var(--gray);
                }

                .acoes button {
                    flex: 1;
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

                .acoes button:first-child { color: white; }
                .acoes button:last-child { background: var(--success); color: white; }

                .footer-buttons {
                    margin-top: 3rem;
                    text-align: center;
                }

                .footer-buttons button {
                    padding: 1rem 2rem;
                    background: transparent;
                    color: var(--text);
                    border: 2px solid var(--text);
                    border-radius: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .footer-buttons button:hover {
                    background: var(--text);
                    color: white;
                }

                /* Responsividade */
                @media (max-width: 768px) {
                    .container { padding-top: 4.5rem; }
                    .card { padding: 1.5rem; border-radius: 1.2rem; }
                    .header h1 { font-size: 2rem; }
                    .header p { font-size: 1rem; }
                    .pedido-header { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
                    .detalhe { flex-direction: column; align-items: flex-start; gap: 0.25rem; }
                    .codigos { justify-content: flex-start; }
                    .acoes { flex-direction: column; }
                }

                @media (max-width: 480px) {
                    .card { padding: 1rem; margin: 0.5rem; }
                    .header h1 { font-size: 1.6rem; }
                    .header p { font-size: 0.9rem; }
                    .acoes button, .footer-buttons button { width: 100%; }
                }
            `}</style>
        </>
    );
}

export default MeusPedidos;