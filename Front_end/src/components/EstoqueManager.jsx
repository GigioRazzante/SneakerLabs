import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext.jsx';

const EstoqueManager = () => {
  const { primaryColor } = useTheme();
  const [estoque, setEstoque] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantidadeRepor, setQuantidadeRepor] = useState({});
  const [modalAberto, setModalAberto] = useState(null);

  // Carregar estoque da API - CORRIGIDO
  const carregarEstoque = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📦 Buscando estoque da API...');
      const response = await fetch('http://localhost:3001/api/estoque/listar');
      
      if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Resposta da API:', data);
      
      if (data.success && data.data) {
        setEstoque(data.data);
        console.log(`✅ ${data.data.length} itens carregados do banco`);
      } else {
        throw new Error(data.error || 'Estrutura de dados inesperada');
      }
    } catch (err) {
      console.error('❌ Erro ao carregar estoque:', err);
      setError(err.message);
      
      // Dados MOCK de fallback
      setEstoque([
        { 
          id: 1, 
          nome_produto: 'Lâmina Branca', 
          quantidade: 50, 
          quantidade_minima: 15,
          localizacao: 'Prateleira A1',
          categoria: 'Lâminas'
        },
        { 
          id: 2, 
          nome_produto: 'Lâmina Preta', 
          quantidade: 50, 
          quantidade_minima: 15,
          localizacao: 'Prateleira A1',
          categoria: 'Lâminas'
        },
        { 
          id: 3, 
          nome_produto: 'Lâmina Azul', 
          quantidade: 50, 
          quantidade_minima: 15,
          localizacao: 'Prateleira A1',
          categoria: 'Lâminas'
        },
        { 
          id: 4, 
          nome_produto: 'Bloco Casual', 
          quantidade: 5, 
          quantidade_minima: 3,
          localizacao: 'Prateleira B2',
          categoria: 'Blocos'
        },
        { 
          id: 5, 
          nome_produto: 'Material Couro', 
          quantidade: 100, 
          quantidade_minima: 20,
          localizacao: 'Prateleira C3',
          categoria: 'Materiais'
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarEstoque();
  }, []);

  // Função para repor item - CORRIGIDA
  const reporItem = async (itemId) => {
    const quantidade = quantidadeRepor[itemId] || 1;
    
    if (quantidade <= 0) {
      alert('A quantidade deve ser maior que zero');
      return;
    }

    try {
      console.log(`🔄 Repondo item ${itemId} com ${quantidade} unidades`);
      
      const response = await fetch(`http://localhost:3001/api/estoque/repor/${itemId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantidade }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao repor item');
      }

      if (data.success && data.data) {
        setEstoque(prevEstoque => 
          prevEstoque.map(item => 
            item.id === itemId 
              ? { 
                  ...item, 
                  quantidade: data.data.quantidade,
                  updated_at: data.data.updated_at
                }
              : item
          )
        );

        setModalAberto(null);
        setQuantidadeRepor(prev => ({ ...prev, [itemId]: 1 }));
        
        alert('Item reposto com sucesso!');
      } else {
        throw new Error(data.error || 'Erro na resposta do servidor');
      }
    } catch (err) {
      console.error('❌ Erro ao repor item:', err);
      alert('Erro ao repor item: ' + err.message);
    }
  };

  // Determinar classe de status baseado na quantidade
  const getStatusClass = (quantidade, quantidadeMinima) => {
    if (quantidade === 0) {
      return 'status-esgotado';
    } else if (quantidade <= quantidadeMinima) {
      return 'status-baixo';
    } else {
      return 'status-ok';
    }
  };

  // Determinar texto do status
  const getStatusText = (quantidade, quantidadeMinima) => {
    if (quantidade === 0) {
      return 'Esgotado';
    } else if (quantidade <= quantidadeMinima) {
      return 'Estoque Baixo';
    } else {
      return 'Disponível';
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div className="loading-spinner">📦 Carregando estoque...</div>
      </div>
    );
  }

  if (error && estoque.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#dc3545' }}>
        <p>❌ Erro ao carregar estoque: {error}</p>
        <button 
          onClick={carregarEstoque}
          className="retry-button"
        >
          🔄 Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .estoque-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
        }
        
        /* Header do Estoque - Estilo Catálogo */
        .estoque-header {
          text-align: center;
          margin-bottom: 4rem;
          position: relative;
        }
        
        .estoque-titulo {
          font-size: 3.5rem;
          font-weight: 800;
          color: var(--primary-color);
          margin-bottom: 1rem;
          background: linear-gradient(135deg, var(--primary-color) 0%, #ffb347 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .estoque-subtitulo {
          font-size: 1.2rem;
          color: #666;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }
        
        /* Botão de Atualizar */
        .atualizar-container {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .atualizar-button {
          background-color: var(--primary-color);
          color: white;
          font-weight: 700;
          padding: 1rem 2rem;
          border-radius: 1rem;
          border: none;
          transition: all 0.3s ease;
          font-size: 1.1rem;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.3);
        }
        
        .atualizar-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(var(--primary-color-rgb), 0.4);
          opacity: 0.95;
        }
        
        /* Estatísticas - Estilo Catálogo */
        .estoque-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }
        
        .stat-card {
          background: white;
          border-radius: 1.5rem;
          padding: 2rem 1.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 2px solid #f8f9fa;
          text-align: center;
        }
        
        .stat-value {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--primary-color);
          margin-bottom: 0.5rem;
        }
        
        .stat-label {
          font-size: 1rem;
          color: #666;
          font-weight: 600;
        }
        
        /* Alerta */
        .alerta-baixo {
          background: #fff3cd;
          border: 2px solid #ffeaa7;
          color: #856404;
          padding: 1.5rem;
          border-radius: 1rem;
          margin-bottom: 2rem;
          text-align: center;
          font-weight: 600;
          font-size: 1.1rem;
        }
        
        /* Grid de Itens - Estilo Catálogo */
        .estoque-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
          align-items: stretch;
        }
        
        /* Cards do Estoque - Estilo Catálogo */
        .estoque-card {
          background: white;
          border-radius: 1.5rem;
          padding: 2rem 1.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 2px solid #f8f9fa;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        
        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #f0f0f0;
        }
        
        .item-info-container {
          flex: 1;
        }
        
        .item-nome {
          font-size: 1.4rem;
          font-weight: 700;
          color: #333;
          margin: 0 0 0.5rem 0;
        }
        
        .item-categoria {
          background: var(--primary-color);
          color: white;
          padding: 0.4rem 0.8rem;
          border-radius: 2rem;
          font-size: 0.9rem;
          font-weight: 600;
        }
        
        .localizacao {
          font-size: 1rem;
          color: #666;
          margin-bottom: 1.5rem;
          font-weight: 500;
        }
        
        .item-details {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          flex: 1;
        }
        
        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.8rem 0;
        }
        
        .detail-label {
          font-weight: 600;
          color: #666;
          font-size: 1rem;
        }
        
        .detail-value {
          font-weight: 700;
          color: #000000;
          font-size: 1.1rem;
        }
        
        .status-esgotado {
          color: #dc3545;
          font-weight: 700;
        }
        
        .status-baixo {
          color: #ffc107;
          font-weight: 700;
        }
        
        .status-ok {
          color: #28a745;
          font-weight: 700;
        }
        
        /* Botão Repor - COM HOVER (clicável) */
        .repor-button {
          width: 100%;
          background-color: var(--primary-color);
          color: white;
          font-weight: 700;
          padding: 1rem 2rem;
          border-radius: 1rem;
          border: none;
          transition: all 0.3s ease;
          font-size: 1.1rem;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.3);
          margin-top: 1rem;
        }
        
        .repor-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(var(--primary-color-rgb), 0.4);
          opacity: 0.95;
        }
        
        .repor-button:disabled {
          background: #9CA3AF;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        
        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .modal-content {
          background: white;
          padding: 2rem;
          border-radius: 1.5rem;
          width: 90%;
          max-width: 400px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          border: 2px solid #f8f9fa;
        }
        
        .modal-title {
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--primary-color);
          margin-bottom: 1rem;
          text-align: center;
        }
        
        .modal-text {
          text-align: center;
          color: #666;
          margin-bottom: 1.5rem;
          line-height: 1.5;
        }
        
        .quantidade-input {
          width: 100%;
          padding: 1rem;
          border: 2px solid #e9ecef;
          border-radius: 1rem;
          font-size: 1.1rem;
          margin: 1.5rem 0;
          text-align: center;
          font-weight: 600;
        }
        
        .quantidade-input:focus {
          outline: none;
          border-color: var(--primary-color);
        }
        
        .modal-actions {
          display: flex;
          gap: 1rem;
        }
        
        .modal-button {
          flex: 1;
          padding: 1rem;
          border: none;
          border-radius: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1.1rem;
        }
        
        .modal-confirm {
          background-color: var(--primary-color);
          color: white;
          box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.3);
        }
        
        .modal-confirm:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(var(--primary-color-rgb), 0.4);
        }
        
        .modal-cancel {
          background-color: #6B7280;
          color: white;
        }
        
        .modal-cancel:hover {
          background-color: #4B5563;
        }
        
        .retry-button {
          background-color: var(--primary-color);
          color: white;
          font-weight: 700;
          padding: 1rem 2rem;
          border-radius: 1rem;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.3);
        }
        
        .retry-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(var(--primary-color-rgb), 0.4);
        }
        
        .loading-spinner {
          color: var(--primary-color);
          font-size: 1.3rem;
          font-weight: 600;
        }

        /* 🔥 RESPONSIVIDADE IGUAL AO CATÁLOGO */
        
        /* Tablets Grandes */
        @media (max-width: 1200px) {
          .estoque-grid {
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 1.5rem;
          }
          
          .estoque-titulo {
            font-size: 3rem;
          }
        }
        
        /* Tablets */
        @media (max-width: 968px) {
          .estoque-content {
            padding: 1.5rem 1rem;
          }
          
          .estoque-titulo {
            font-size: 2.5rem;
          }
          
          .estoque-grid {
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
          }
          
          .estoque-card {
            padding: 1.5rem 1rem;
          }
          
          .estoque-stats {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
          }
        }
        
        /* Tablets Pequenos e Mobile Grande */
        @media (max-width: 768px) {
          .estoque-header {
            margin-bottom: 3rem;
          }
          
          .estoque-titulo {
            font-size: 2.2rem;
          }
          
          .estoque-subtitulo {
            font-size: 1.1rem;
            padding: 0 1rem;
          }
          
          .estoque-grid {
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.2rem;
          }
          
          .item-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.8rem;
          }
          
          .modal-actions {
            flex-direction: column;
          }
        }
        
        /* Mobile Médio */
        @media (max-width: 640px) {
          .estoque-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          
          .estoque-card {
            padding: 1.5rem 1rem;
            border-radius: 1rem;
          }
          
          .estoque-titulo {
            font-size: 1.8rem;
          }
        }
        
        /* Mobile Pequeno */
        @media (max-width: 480px) {
          .estoque-content {
            padding: 1rem 0.5rem;
          }
          
          .estoque-titulo {
            font-size: 1.6rem;
          }
          
          .estoque-subtitulo {
            font-size: 1rem;
          }
          
          .estoque-card {
            padding: 1.2rem 0.8rem;
          }
          
          .repor-button {
            padding: 0.9rem 1.5rem;
            font-size: 1rem;
          }
        }
      `}</style>

      <div className="estoque-content">
        {/* Header - Estilo Catálogo */}
        <header className="estoque-header">
          <h1 className="estoque-titulo">Gestão de Estoque</h1>
          <p className="estoque-subtitulo">
            Controle e reposição de materiais da produção SneakLab
          </p>
        </header>

        {/* Botão de atualizar */}
        <div className="atualizar-container">
          <button 
            onClick={carregarEstoque} 
            className="atualizar-button"
          >
            🔄 Atualizar Estoque
          </button>
        </div>

        {/* Estatísticas do Estoque - Estilo Catálogo */}
        <div className="estoque-stats">
          <div className="stat-card">
            <div className="stat-value">{estoque.length}</div>
            <div className="stat-label">Itens no Estoque</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {estoque.filter(item => item.quantidade > (item.quantidade_minima || 5)).length}
            </div>
            <div className="stat-label">Itens com Estoque OK</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {estoque.filter(item => item.quantidade <= (item.quantidade_minima || 5) && item.quantidade > 0).length}
            </div>
            <div className="stat-label">Itens com Estoque Baixo</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {estoque.filter(item => item.quantidade === 0).length}
            </div>
            <div className="stat-label">Itens Esgotados</div>
          </div>
        </div>

        {/* Alerta se houver itens com estoque baixo */}
        {estoque.filter(item => item.quantidade <= (item.quantidade_minima || 5) && item.quantidade > 0).length > 0 && (
          <div className="alerta-baixo">
            ⚠️ {estoque.filter(item => item.quantidade <= (item.quantidade_minima || 5) && item.quantidade > 0).length} 
            item(s) com estoque baixo precisam de reposição!
          </div>
        )}

        {/* Grid de Itens - Estilo Catálogo */}
        <div className="estoque-grid">
          {estoque.map((item) => (
            <div key={item.id} className="estoque-card">
              <div className="item-header">
                <div className="item-info-container">
                  <h3 className="item-nome">{item.nome_produto}</h3>
                  {item.localizacao && (
                    <div className="localizacao">📍 {item.localizacao}</div>
                  )}
                </div>
                <span className="item-categoria">{item.categoria || 'Geral'}</span>
              </div>
              
              <div className="item-details">
                <div className="detail-row">
                  <span className="detail-label">Quantidade Atual:</span>
                  <span className="detail-value">{item.quantidade} unidades</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Estoque Mínimo:</span>
                  <span className="detail-value">{item.quantidade_minima || 5} unidades</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className={getStatusClass(item.quantidade, item.quantidade_minima || 5)}>
                    {getStatusText(item.quantidade, item.quantidade_minima || 5)}
                  </span>
                </div>
              </div>
              
              {/* Botão Repor - ÚNICO com hover (clicável) */}
              <button
                className="repor-button"
                onClick={() => setModalAberto(item.id)}
              >
                ➕ Repor Estoque
              </button>
            </div>
          ))}
        </div>

        {/* Modal de Reposição */}
        {modalAberto && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 className="modal-title">Repor Estoque</h3>
              <p className="modal-text">
                Quantidade a adicionar para:<br />
                <strong>{estoque.find(item => item.id === modalAberto)?.nome_produto}</strong>
              </p>
              
              <input
                type="number"
                min="1"
                max="1000"
                value={quantidadeRepor[modalAberto] || 1}
                onChange={(e) => setQuantidadeRepor(prev => ({
                  ...prev,
                  [modalAberto]: parseInt(e.target.value) || 1
                }))}
                className="quantidade-input"
                placeholder="Quantidade"
              />
              
              <div className="modal-actions">
                <button
                  className="modal-button modal-cancel"
                  onClick={() => {
                    setModalAberto(null);
                    setQuantidadeRepor(prev => ({ ...prev, [modalAberto]: 1 }));
                  }}
                >
                  Cancelar
                </button>
                <button
                  className="modal-button modal-confirm"
                  onClick={() => reporItem(modalAberto)}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default EstoqueManager;