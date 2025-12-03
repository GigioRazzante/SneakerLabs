import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import MenuSelecao from '../components/MenuSelecao';
import ResumoPedido from '../components/ResumoPedido';
import CarrinhoPedido from '../components/CarrinhoPedido';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx'; // 🎨 NOVO IMPORT

// Mantenha o passos igual ao seu original
const passos = [
  {
    titulo: "Passo 1 de 5: Escolha o seu estilo.",
    opcoes: [
      { id: 1, nome: "Casual", preco: "R$ 200", acrescimo: 200 },
      { id: 2, nome: "Corrida", preco: "R$ 350", acrescimo: 350 },
      { id: 3, nome: "Skate", preco: "R$ 300", acrescimo: 300 }
    ],
  },
  {
    titulo: "Passo 2 de 5: Escolha o material.",
    opcoes: [
      { id: 1, nome: "Couro", preco: "+ R$ 100", acrescimo: 100 },
      { id: 2, nome: "Camurça", preco: "+ R$ 120", acrescimo: 120 },
      { id: 3, nome: "Tecido", preco: "+ R$ 90", acrescimo: 90 }
    ],
  },
  {
    titulo: "Passo 3 de 5: Escolha o solado.",
    opcoes: [
      { id: 1, nome: "Borracha", preco: "+ R$ 40", acrescimo: 40 },
      { id: 2, nome: "EVA", preco: "+ R$ 60", acrescimo: 60 },
      { id: 3, nome: "Air", preco: "+ R$ 90", acrescimo: 90 }
    ],
  },
  {
    titulo: "Passo 4 de 5: Escolha a cor.",
    opcoes: [
      { id: 1, nome: "Branco", preco: "+ R$ 20", acrescimo: 20, background: "#FFFFFF" },
      { id: 2, nome: "Preto", preco: "+ R$ 30", acrescimo: 30, background: "#000000" },
      { id: 3, nome: "Azul", preco: "+ R$ 25", acrescimo: 25, background: "#007BFF" },
      { id: 4, nome: "Vermelho", preco: "+ R$ 28", acrescimo: 28, background: "#DC3545" },
      { id: 5, nome: "Verde", preco: "+ R$ 23", acrescimo: 23, background: "#28A745" },
      { id: 6, nome: "Amarelo", preco: "+ R$ 30", acrescimo: 30, background: "#FFC107" }
    ],
  },
  {
    titulo: "Passo 5 de 5: Adicione detalhes.",
    opcoes: [
      { id: 1, nome: "Cadarço normal", preco: "+ R$ 20", acrescimo: 20 },
      { id: 2, nome: "Cadarço colorido", preco: "+ R$ 30", acrescimo: 30 },
      { id: 3, nome: "Sem cadarço", preco: "+ R$ 35", acrescimo: 35 }
    ],
  },
];

const PaginaCriarSneaker = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState({});
  const [pedidos, setPedidos] = useState([]);
  
  const { user } = useAuth();
  const { primaryColor } = useTheme(); // 🎨 HOOK DO TEMA

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
        <p>Você precisa estar logado para criar um sneaker personalizado.</p>
        <button 
          onClick={() => window.location.href = '/login'}
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

  const handleSelectOption = (stepId, optionId, acrescimo) => {
    setSelections({
      ...selections,
      [stepId]: { id: optionId, acrescimo }
    });
  };

  const handleNextStep = () => {
    const selected = selections[currentStep];
    if (selected && selected.id !== undefined) {
      if (currentStep < passos.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setCurrentStep(passos.length);
      }
    } else {
      alert("Por favor, selecione uma opção para continuar.");
    }
  };

  const handleFinalize = (pedidoData) => {
    console.log('📦 [PaginaCriarSneaker] Dados recebidos do ResumoPedido:', pedidoData);
    
    const dadosRecebidos = pedidoData || { items: [], valorTotal: 0 };
    
    const novoPedido = {
      id: Date.now(),
      items: dadosRecebidos.items || [],
      valorTotal: dadosRecebidos.valorTotal || 0,
      dataCriacao: new Date().toLocaleString('pt-BR')
    };

    console.log('✅ [PaginaCriarSneaker] Novo pedido criado:', novoPedido);
    
    setPedidos([...pedidos, novoPedido]);
    setSelections({});
    setCurrentStep(passos.length + 1);
  };

  const handleIncluirMaisPedidos = () => {
    setSelections({});
    setCurrentStep(0);
  };

  const handleConfirmarPedidos = async () => {
    if (pedidos.length === 0) return;

    if (!user || !user.id) {
        alert('Erro: Usuário não identificado. Faça login novamente.');
        return null;
    }

    console.log("🔐 USUÁRIO LOGADO:", user);
    console.log("📝 Enviando pedido como cliente ID:", user.id);

    console.log('🔍 [DEBUG] Estrutura completa dos pedidos:', JSON.stringify(pedidos, null, 2));
    
    pedidos.forEach((pedido, index) => {
        console.log(`📊 Pedido ${index}:`, {
          id: pedido.id,
          hasItems: !!pedido.items,
          itemsIsArray: Array.isArray(pedido.items),
          itemsLength: pedido.items?.length,
          itemsStructure: pedido.items?.map(item => ({
            step: item?.step,
            name: item?.name,
            hasAcrescimo: !!item?.acrescimo
          }))
        });
    });

    const stepMap = {
        0: "passoUmDeCinco",
        1: "passoDoisDeCinco", 
        2: "passoTresDeCinco",
        3: "passoQuatroDeCinco",
        4: "passoCincoDeCinco",
    };

    // 🚨 CORREÇÃO: Filtrar apenas pedidos válidos
    const pedidosValidos = pedidos.filter(pedido => {
        const isValid = pedido && 
                        Array.isArray(pedido.items) && 
                        pedido.items.length === 5;
        
        if (!isValid) {
            console.error(`❌ Pedido ${pedido.id} inválido:`, {
                itemsLength: pedido.items?.length,
                items: pedido.items
            });
        }
        return isValid;
    });

    if (pedidosValidos.length === 0) {
        alert('❌ Nenhum pedido válido para confirmar. Todos os pedidos devem ter 5 opções selecionadas.');
        return null;
    }

    console.log(`✅ ${pedidosValidos.length} de ${pedidos.length} pedidos são válidos`);

    const produtosParaEnvio = pedidosValidos.map((pedido, pedidoIndex) => {
        const configuracoes = {};
        let valorTotal = 0;

        console.log(`🔍 Processando pedido válido ${pedidoIndex + 1}:`, pedido);
        
        if (!pedido.items || !Array.isArray(pedido.items) || pedido.items.length !== 5) {
            console.error(`❌ ERRO CRÍTICO: Pedido ${pedidoIndex + 1} inválido mesmo após filtro`);
            throw new Error(`Pedido ${pedidoIndex + 1} inválido - deve ter 5 itens`);
        }

        passos.forEach((passo, index) => {
            const itemDoPedido = pedido.items.find(item => {
                if (!item) {
                    console.error(`❌ Item null/undefined no pedido ${pedidoIndex + 1}`);
                    return false;
                }
                if (item.step === undefined || item.name === undefined) {
                    console.error(`❌ Item sem step/name no pedido ${pedidoIndex + 1}:`, item);
                    return false;
                }
                return item.step === index + 1;
            });
            
            if (itemDoPedido) {
                const newKey = stepMap[index];
                configuracoes[newKey] = itemDoPedido.name;
                valorTotal += itemDoPedido.acrescimo || 0;
                console.log(`   ✅ Passo ${index + 1}: ${itemDoPedido.name} - R$ ${itemDoPedido.acrescimo}`);
            } else {
                console.error(`❌ ERRO: Pedido ${pedidoIndex + 1} faltando passo ${index + 1}`);
                console.error('Itens disponíveis:', pedido.items.map(item => ({
                    step: item?.step, 
                    name: item?.name,
                    acrescimo: item?.acrescimo
                })));
                throw new Error(`Pedido ${pedidoIndex + 1} incompleto - falta passo ${index + 1}`);
            }
        });

        const passosPreenchidos = Object.keys(configuracoes);
        if (passosPreenchidos.length !== 5) {
            const erroMsg = `❌ Erro: O pedido ${pedidoIndex + 1} está incompleto. Faltam ${5 - passosPreenchidos.length} opções.`;
            console.error(erroMsg);
            alert(erroMsg);
            throw new Error(`Pedido ${pedidoIndex + 1} incompleto`);
        }

        console.log(`✅ Pedido ${pedidoIndex + 1} completo - Valor: R$ ${valorTotal.toFixed(2)}`);

        return {
            configuracoes: configuracoes,
            valor: valorTotal
        };
    });

    const bodyRequisicao = {
        clienteId: user.id,
        produtos: produtosParaEnvio
    };
    
    console.log("📦 CONFIRMAÇÃO - Dados para backend:");
    console.log("Cliente ID:", user.id);
    console.log("Número de produtos:", produtosParaEnvio.length);
    console.log("Valores dos produtos:", produtosParaEnvio.map(p => `R$ ${p.valor.toFixed(2)}`));
    console.log("Total do pedido:", produtosParaEnvio.reduce((sum, p) => sum + p.valor, 0).toFixed(2));
    console.log("JSON completo enviado para o Backend:", JSON.stringify(bodyRequisicao, null, 2));

    try {
        console.log("🚀 Enviando requisição para /api/orders...");
        
        const response = await fetch('http://localhost:3001/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bodyRequisicao),
        });

        console.log("📨 Resposta do servidor - Status:", response.status);

        if (!response.ok) {
            const errorData = await response.json();
            console.error("❌ Erro do servidor:", errorData);
            throw new Error(errorData.error || `Erro HTTP ${response.status}: Falha ao enviar pedido.`);
        }

        const successData = await response.json();
        console.log("✅ Sucesso! Dados retornados:", successData);
        
        // 🎯 CORREÇÃO AQUI: O backend agora retorna 'produtos' em vez de 'produtosEnviados'
        // Verifique qual campo está disponível
        const produtosRetornados = successData.produtos || successData.produtosEnviados || [];
        
        // Calcular valor total baseado na resposta ou nos dados locais
        const valorTotalCalculado = successData.valorTotal || 
                                   produtosParaEnvio.reduce((sum, p) => sum + p.valor, 0);
        
        alert(`🎉 Pedido #${successData.pedidoId} ${successData.message || 'processado com sucesso'}! Valor: R$ ${valorTotalCalculado.toFixed(2)}`);
        
        // 🎯 CORREÇÃO: Criar objeto de pedido com o formato correto
        const pedidoCriado = {
            id: successData.pedidoId,
            produtos: produtosRetornados, // Usa o campo correto
            valorTotal: valorTotalCalculado,
            status: successData.status || 'PROCESSANDO',
            modo: successData.modo || 'SIMULAÇÃO'
        };
        
        setSelections({});
        setPedidos([]);
        setCurrentStep(0);
        
        // 🎯 DEBUG: Verificar os dados retornados
        console.log("📊 Pedido criado:", pedidoCriado);
        console.log("📦 Produtos retornados:", produtosRetornados.length);
        
        // 🎯 RETORNE O PEDIDO CRIADO
        return pedidoCriado;
        
    } catch (error) {
        console.error('❌ Erro na requisição POST /api/orders:', error);
        console.error('Stack trace:', error.stack);
        alert(`Ocorreu um erro ao enviar os pedidos: ${error.message}`);
        return null;
    }
};

  const renderCurrentStep = () => {
    if (currentStep < passos.length) {
      return (
        <MenuSelecao
          passo={passos[currentStep]}
          onSelect={(optionId, acrescimo) => handleSelectOption(currentStep, optionId, acrescimo)}
          selectedOption={selections[currentStep]}
          onNext={handleNextStep}
        />
      );
    } else if (currentStep === passos.length) {
      return (
        <ResumoPedido
          selections={selections}
          passos={passos}
          onFinalize={handleFinalize}
        />
      );
    } else if (currentStep === passos.length + 1 && pedidos.length > 0) {
      return (
        <CarrinhoPedido
          pedidos={pedidos}
          onConfirmarPedidos={handleConfirmarPedidos}
          onIncluirMaisPedidos={handleIncluirMaisPedidos}
        />
      );
    }
    return (
      <div style={{textAlign: 'center', marginTop: '5rem'}}>
        <h2>Carrinho Vazio</h2>
        <button 
          className="next-button" 
          onClick={() => setCurrentStep(0)}
          style={{maxWidth: '250px'}}
        >
          Começar a Personalizar
        </button>
      </div>
    );
  };

  return (
    <>
      <style>{`
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
          max-width: 960px;
          background-color: white;
          border-radius: 1.5rem; 
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15); 
          padding: 2.5rem;
          margin: 1.5rem 0; 
          /* 🎯 CORREÇÃO CRÍTICA 1: Habilita o posicionamento absoluto dentro do card */
          position: relative;
        }

        /* 🎯 CORREÇÃO CRÍTICA 2: Header Bar com cor do tema */
        .card-header-bar {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 8px; /* Altura ajustada */
            background-color: var(--primary-color); /* 🎨 USA A COR DO TEMA */
            border-top-left-radius: 1.5rem;
            border-top-right-radius: 1.5rem;
            transition: background-color 0.3s ease; /* 🎨 TRANSITION SUAVE */
        }

        .next-button {
          width: 100%;
          max-width: 300px;
          background-color: #22C55E;
          color: white;
          font-weight: 600;
          padding: 0.8rem;
          border-radius: 9999px;
          border: none;
          transition: background-color 0.3s;
          font-size: 1.1rem;
          cursor: pointer;
        }
        
        .next-button:hover {
          background-color: #1A9C4B;
        }
        
        @media (max-width: 768px) {
          :root {
            --navbar-height: 4.5rem;
          }
          .page-container {
            padding-top: var(--navbar-height);
          }
          .main-content-card {
            padding: 1.5rem;
            margin: 1rem 0;
          }
        }

        @media (max-width: 480px) {
          .main-content-card {
            padding: 1rem;
            margin: 0.5rem 0;
            border-radius: 1rem;
          }
        }
      `}</style>
      
      <Navbar />

      <div className="page-container">
        <div className="main-content-card">
          {/* 🎯 DIV DO HEADER BAR: Agora usa a cor do tema do usuário */}
          <div className="card-header-bar"></div>
          {renderCurrentStep()}
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default PaginaCriarSneaker;