// components/ConfirmarRemocaoModal.jsx
import React from 'react';

const API_BASE_URL = 'https://sneakerslab-backend.onrender.com';

const ConfirmarRemocaoModal = ({ produto, onConfirm, onCancel }) => {
  const handleConfirm = async () => {
    try {
     const response = await fetch(`${API_BASE_URL}/api/produtos/remover/${produto.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao remover produto');
      }

      const data = await response.json();
      onConfirm(data);
      
    } catch (error) {
      console.error('Erro ao remover produto:', error);
      alert('Erro ao remover produto: ' + error.message);
    }
  };

  return (
    <>
      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 1rem;
        }
        
        .modal-content {
          background: white;
          border-radius: 1rem;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        
        .modal-header {
          background: #dc3545;
          color: white;
          padding: 1.5rem;
          border-top-left-radius: 1rem;
          border-top-right-radius: 1rem;
          text-align: center;
        }
        
        .modal-title {
          font-size: 1.3rem;
          font-weight: bold;
          margin: 0;
        }
        
        .modal-body {
          padding: 2rem;
          text-align: center;
        }
        
        .warning-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        
        .warning-text {
          color: #666;
          line-height: 1.5;
          margin-bottom: 1rem;
        }
        
        .product-info {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 0.5rem;
          margin: 1rem 0;
          text-align: left;
        }
        
        .info-item {
          margin-bottom: 0.5rem;
        }
        
        .info-label {
          font-weight: 600;
          color: #333;
        }
        
        .modal-footer {
          padding: 1.5rem;
          border-top: 1px solid #e9ecef;
          display: flex;
          gap: 1rem;
          justify-content: center;
        }
        
        .confirm-button {
          background: #dc3545;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s;
        }
        
        .confirm-button:hover {
          background: #c82333;
        }
        
        .cancel-button {
          background: #6c757d;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s;
        }
        
        .cancel-button:hover {
          background: #545b62;
        }
        
        @media (max-width: 480px) {
          .modal-footer {
            flex-direction: column;
          }
          
          .confirm-button,
          .cancel-button {
            width: 100%;
          }
        }
      `}</style>

      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title">⚠️ Confirmar Remoção</h2>
          </div>
          
          <div className="modal-body">
            <div className="warning-icon">🗑️</div>
            <p className="warning-text">
              Tem certeza que deseja remover este sneaker do pedido?
              Esta ação não pode ser desfeita.
            </p>
            
            <div className="product-info">
              <div className="info-item">
                <span className="info-label">Estilo:</span> {produto.passo_um}
              </div>
              <div className="info-item">
                <span className="info-label">Material:</span> {produto.passo_dois}
              </div>
              <div className="info-item">
                <span className="info-label">Cor:</span> {produto.passo_quatro}
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button className="cancel-button" onClick={onCancel}>
              Cancelar
            </button>
            <button className="confirm-button" onClick={handleConfirm}>
              Sim, Remover
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmarRemocaoModal;