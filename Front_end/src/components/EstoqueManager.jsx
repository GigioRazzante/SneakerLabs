import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext.jsx'; // 🎨 NOVO IMPORT

const EstoqueManager = () => {
  const { primaryColor } = useTheme(); // 🎨 HOOK DO TEMA
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
      
      // CORREÇÃO: A API retorna data.data, não data.estoque
      if (data.success && data.data) {
        setEstoque(data.data);
        console.log(`✅ ${data.data.length} itens carregados do banco`);
      } else {
        // Se a tabela estiver vazia ou estrutura diferente
        throw new Error(data.error || 'Estrutura de dados inesperada');
      }
    } catch (err) {
      console.error('❌ Erro ao carregar estoque:', err);
      setError(err.message);
      
      // Dados MOCK de fallback baseados na SUA estrutura real
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

      // CORREÇÃO: Atualizar estoque local com a resposta correta
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
        .estoque-container {
          width: 100%;
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .card-header-bar {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 1.5rem;
          background-color: var(--primary-color); /* 🎨 COR DO TEMA */
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
          color: var(--primary-color); /* 🎨 COR DO TEMA */
          margin-bottom: 0.5rem;
        }
        
        .subtitle {
          color: #555;
          font-size: 1.1rem;
        }
        
        .estoque-stats {
          display: flex;
          justify-content: space-around;
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 0.75rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .stat-item {
          text-align: center;
        }
        
        .stat-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: var(--primary-color); /* 🎨 COR DO TEMA */
        }
        
        .stat-label {
          font-size: 0.9rem;
          color: #666;
        }
        
        .estoque-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
          margin-top: 1rem;
        }
        
        .estoque-card {
          background: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
          border: 2px solid #e9ecef;
          transition: all 0.3s ease;
          position: relative;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .estoque-card:hover {
          border-color: var(--primary-color); /* 🎨 COR DO TEMA */
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }
        
        .item-codigo-nome {
          flex: 1;
        }
        
        .item-nome {
          font-size: 1.2rem;
          font-weight: 600;
          color: #333;
          margin: 0 0 0.5rem 0;
        }
        
        .item-categoria {
          background: #6c757d;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.8rem;
          font-weight: 500;
          white-space: nowrap;
        }
        
        .item-info {
          margin-bottom: 1rem;
        }
        
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          padding: 0.25rem 0;
        }
        
        .info-label {
          color: #666;
          font-weight: 500;
        }
        
        .info-value {
          color: #333;
          font-weight: 600;
        }
        
        .localizacao {
          font-size: 0.9rem;
          color: #888;
          font-style: italic;
          margin-bottom: 0.5rem;
        }
        
        .status-esgotado {
          color: #dc3545;
          font-weight: 600;
        }
        
        .status-baixo {
          color: #ffc107;
          font-weight: 600;
        }
        
        .status-ok {
          color: #28a745;
          font-weight: 600;
        }
        
        .repor-button {
          width: 100%;
          background-color: var(--primary-color); /* 🎨 COR DO TEMA */
          color: white;
          border: none;
          padding: 0.75rem;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s;
          margin-top: 0.5rem;
        }
        
        .repor-button:hover {
          background-color: var(--primary-hover); /* 🎨 COR DO TEMA HOVER */
        }
        
        .repor-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
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
          border-radius: 1rem;
          width: 90%;
          max-width: 400px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }
        
        .modal-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 1rem;
          text-align: center;
        }
        
        .quantidade-input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e9ecef;
          border-radius: 0.5rem;
          font-size: 1rem;
          margin: 1rem 0;
        }
        
        .quantidade-input:focus {
          outline: none;
          border-color: var(--primary-color); /* 🎨 COR DO TEMA */
        }
        
        .modal-actions {
          display: flex;
          gap: 1rem;
        }
        
        .modal-button {
          flex: 1;
          padding: 0.75rem;
          border: none;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        
        .modal-confirm {
          background-color: #28a745;
          color: white;
        }
        
        .modal-confirm:hover {
          background-color: #218838;
        }
        
        .modal-cancel {
          background-color: #6c757d;
          color: white;
        }
        
        .modal-cancel:hover {
          background-color: #545b62;
        }
        
        .retry-button {
          background-color: var(--primary-color); /* 🎨 COR DO TEMA */
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          margin-top: 1rem;
        }
        
        .loading-spinner {
          color: var(--primary-color); /* 🎨 COR DO TEMA */
          font-size: 1.1rem;
          font-weight: 500;
        }
        
        .alerta-baixo {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          color: #856404;
          padding: 0.5rem;
          border-radius: 0.25rem;
          margin-bottom: 1rem;
          text-align: center;
          font-weight: 500;
        }
        
        @media (max-width: 768px) {
          .estoque-container {
            padding: 1rem;
          }
          
          .estoque-grid {
            grid-template-columns: 1fr;
          }
          
          .title {
            font-size: 1.8rem;
          }
          
          .modal-content {
            margin: 1rem;
            padding: 1.5rem;
          }
          
          .estoque-stats {
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
          }
        }
      `}</style>

      <div className="estoque-container">
        <div className="card-header-bar"></div>

        <div className="title-section">
          <h1 className="title">📦 Gestão de Estoque</h1>
          <p className="subtitle">Controle e reposição de materiais da produção</p>
        </div>

        {/* Botão de atualizar */}
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <button 
            onClick={carregarEstoque} 
            className="repor-button"
            style={{ width: 'auto', padding: '0.5rem 1rem' }}
          >
            🔄 Atualizar Estoque
          </button>
        </div>

        {/* Estatísticas do Estoque */}
        <div className="estoque-stats">
          <div className="stat-item">
            <div className="stat-value">{estoque.length}</div>
            <div className="stat-label">Itens no Estoque</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">
              {estoque.filter(item => item.quantidade > (item.quantidade_minima || 5)).length}
            </div>
            <div className="stat-label">Itens com Estoque OK</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">
              {estoque.filter(item => item.quantidade <= (item.quantidade_minima || 5) && item.quantidade > 0).length}
            </div>
            <div className="stat-label">Itens com Estoque Baixo</div>
          </div>
          <div className="stat-item">
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

        <div className="estoque-grid">
          {estoque.map((item) => (
            <div key={item.id} className="estoque-card">
              <div className="item-header">
                <div className="item-codigo-nome">
                  <h3 className="item-nome">{item.nome_produto}</h3>
                </div>
                <span className="item-categoria">{item.categoria || 'Geral'}</span>
              </div>
              
              {item.localizacao && (
                <div className="localizacao">📍 {item.localizacao}</div>
              )}
              
              <div className="item-info">
                <div className="info-row">
                  <span className="info-label">Quantidade Atual:</span>
                  <span className="info-value">{item.quantidade} unidades</span>
                </div>
                
                <div className="info-row">
                  <span className="info-label">Estoque Mínimo:</span>
                  <span className="info-value">{item.quantidade_minima || 5} unidades</span>
                </div>
                
                <div className="info-row">
                  <span className="info-label">Status:</span>
                  <span className={getStatusClass(item.quantidade, item.quantidade_minima || 5)}>
                    {getStatusText(item.quantidade, item.quantidade_minima || 5)}
                  </span>
                </div>
              </div>
              
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
              <p>Quantidade a adicionar para:</p>
              <p><strong>{estoque.find(item => item.id === modalAberto)?.nome_produto}</strong></p>
              
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