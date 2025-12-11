import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import MenuSelecao from '../components/MenuSelecao';
import ResumoPedido from '../components/ResumoPedido';
import CarrinhoPedido from '../components/CarrinhoPedido';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

const API_BASE_URL = 'https://sneakerslab-backend.onrender.com';

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
      { id: 1, nome: "Branco", preco: "+ R$ 20", acrescimo: 20, background: "#FFFFFF", cor: "branco" },
      { id: 2, nome: "Preto", preco: "+ R$ 30", acrescimo: 30, background: "#000000", cor: "preto" },
      { id: 3, nome: "Azul", preco: "+ R$ 25", acrescimo: 25, background: "#007BFF", cor: "azul" },
      { id: 4, nome: "Vermelho", preco: "+ R$ 28", acrescimo: 28, background: "#DC3545", cor: "vermelho" },
      { id: 5, nome: "Verde", preco: "+ R$ 23", acrescimo: 23, background: "#28A745", cor: "verde" },
      { id: 6, nome: "Amarelo", preco: "+ R$ 30", acrescimo: 30, background: "#FFC107", cor: "amarelo" }
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

// ============================================
// 🎯 NOVAS FUNÇÕES DE EXTRAÇÃO E TRADUÇÃO
// ============================================

/**
 * Função auxiliar para extrair configuração completa do sneaker a partir dos passos.
 */
const extrairConfiguracaoSneaker = (items) => {
  console.log('🔍 Extraindo configuração completa do sneaker:', items);
  
  const config = {
    estilo: 'Casual',       // padrão
    material: 'Couro',      // padrão
    solado: 'Borracha',     // padrão
    cor: 'branco',          // padrão (lowercase)
    detalhes: 'Cadarço normal', // padrão
    tamanho: 42             // padrão
  };
  
  if (!items || !Array.isArray(items)) {
    console.warn('⚠️ Items inválidos ou vazios');
    return config;
  }
  
  // Mapear cada passo para a configuração
  items.forEach(item => {
    if (!item || item.step === undefined || !item.nome) return;
    
    switch(item.step) {
      case 0: // Passos são 0-indexados no `selections` (estilo)
      case 1: // Estilo
        config.estilo = item.nome;
        break;
      case 2: // Material
        config.material = item.nome;
        break;
      case 3: // Solado
        config.solado = item.nome;
        break;
      case 4: // Cor
        // Encontra o objeto de opção no passos para garantir que pegamos o campo 'cor' minúsculo
        const stepCor = passos.find(p => p.titulo.includes("Cor"));
        const corOpcao = stepCor?.opcoes.find(o => o.nome === item.nome);
        config.cor = corOpcao?.cor || item.nome.toLowerCase(); // Salva em minúsculo
        break;
      case 5: // Detalhes (Cadarços)
        config.detalhes = item.nome;
        break;
    }
  });

  // Ajuste para garantir que, se for passado o objeto selections, a extração funcione
  // Se for passado o array de items do pedido (com a estrutura {nome, acrescimo, step})
  const stepItems = Object.values(items).filter(item => item.step !== undefined);
  if (stepItems.length > 0) {
    stepItems.forEach(item => {
      if (!item || item.step === undefined || !item.nome) return;
      
      const stepIndex = item.step; // Índice do passo original
      
      switch(stepIndex) {
        case 0: // Passos[0]: Estilo
          config.estilo = item.nome;
          break;
        case 1: // Passos[1]: Material
          config.material = item.nome;
          break;
        case 2: // Passos[2]: Solado
          config.solado = item.nome;
          break;
        case 3: // Passos[3]: Cor
          const stepCor = passos[3];
          const corOpcao = stepCor.opcoes.find(o => o.nome === item.nome);
          config.cor = corOpcao?.cor || item.nome.toLowerCase();
          break;
        case 4: // Passos[4]: Detalhes
          config.detalhes = item.nome;
          break;
      }
    });
  }
  
  console.log('✅ Configuração extraída:', config);
  return config;
};

/**
 * Mapeamento de tradução do formato local para o Queue Smart 4.0.
 */
const traduzirParaQueueSmart = (config) => {
  const traducoes = {
    // Estilos
    'Casual': 'CASUAL',
    'Corrida': 'RUNNING', 
    'Skate': 'SKATE',
    
    // Materiais
    'Couro': 'LEATHER',
    'Camurça': 'SUEDE',
    'Tecido': 'TEXTILE',
    
    // Solados
    'Borracha': 'RUBBER_SOLE',
    'EVA': 'EVA_SOLE',
    'Air': 'AIR_SOLE',
    
    // Cores (Espera string Capitalizada)
    'Branco': 'WHITE',
    'Preto': 'BLACK',
    'Azul': 'BLUE',
    'Vermelho': 'RED',
    'Verde': 'GREEN',
    'Amarelo': 'YELLOW',
    
    // Cadarços
    'Cadarço normal': 'STANDARD_LACES',
    'Cadarço colorido': 'COLORED_LACES',
    'Sem cadarço': 'NO_LACES'
  };
  
  // A cor no objeto config está em minúsculo ('branco', 'preto', etc.)
  // O mapeamento `traducoes` espera a cor Capitalizada ('Branco', 'Preto', etc.)
  const corCapitalizada = config.cor.charAt(0).toUpperCase() + config.cor.slice(1);

  return {
    style: traducoes[config.estilo] || 'CASUAL',
    material: traducoes[config.material] || 'LEATHER',
    sole: traducoes[config.solado] || 'RUBBER_SOLE',
    color: traducoes[corCapitalizada] || 'WHITE',
    laces: traducoes[config.detalhes] || 'STANDARD_LACES',
    size: config.tamanho || 42
  };
};

// ============================================
// FUNÇÃO DE VERIFICAÇÃO DE ESTOQUE
// ============================================

/**
 * Verifica estoque no Queue Smart antes de enviar (apenas por cor).
 * @param {string} cor - Cor a verificar
 * @returns {Promise<{disponivel: boolean, quantidade: number, mensagem: string}>}
 */
const verificarEstoqueQueueSmart = async (cor) => {
  console.log(`📦 Verificando estoque para cor: ${cor}`);
  
  try {
    // Note: Usamos a cor extraída (minúscula) para a verificação do backend
    const response = await fetch(`${API_BASE_URL}/api/orders/estoque/cor/${cor}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      console.error(`❌ Erro HTTP ${response.status} ao verificar estoque`);
      return {
        disponivel: false,
        quantidade: 0,
        mensagem: `Erro ao verificar estoque (${response.status})`
      };
    }

    const data = await response.json();
    console.log('📊 Resposta da verificação de estoque:', data);

    if (data.success && data.estoque?.queue_smart) {
      const estoqueQueue = data.estoque.queue_smart;
      
      return {
        disponivel: estoqueQueue.disponivel || false,
        quantidade: estoqueQueue.quantidade || 0,
        mensagem: estoqueQueue.disponivel 
          ? `Estoque disponível: ${estoqueQueue.quantidade} unidades`
          : `Estoque insuficiente. Disponível: ${estoqueQueue.quantidade || 0}`
      };
    } else {
      return {
        disponivel: false,
        quantidade: 0,
        mensagem: 'Erro na resposta do servidor de estoque'
      };
    }

  } catch (error) {
    console.error('❌ Erro ao verificar estoque:', error);
    return {
      disponivel: false,
      quantidade: 0,
      mensagem: `Erro de conexão: ${error.message}`
    };
  }
};

const PaginaCriarSneaker = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState({});
  const [pedidos, setPedidos] = useState([]);
  const [enderecoEntrega] = useState({
    rua: 'Rua Demo',
    numero: '123',
    bairro: 'Centro',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '00000-000',
    complemento: 'Demonstração'
  });
  
  const { user } = useAuth();
  const { primaryColor } = useTheme();

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

  const handleSelectOption = (stepIndex, optionId, acrescimo, nome) => {
    setSelections({
      ...selections,
      [stepIndex]: { id: optionId, acrescimo, nome, step: stepIndex } // stepIndex: 0 a 4
    });
  };

  const handleNextStep = () => {
    const selected = selections[currentStep];
    if (selected && selected.id !== undefined) {
      if (currentStep < passos.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setCurrentStep(passos.length); // Vai para a tela de Resumo
      }
    } else {
      alert("Por favor, selecione uma opção para continuar.");
    }
  };

  const handleFinalize = (pedidoData) => {
    const dadosRecebidos = pedidoData || { items: [], valorTotal: 0 };
    
    // Converte o objeto de selections em um array de items para salvar no pedido
    const itemsArray = Object.values(dadosRecebidos.items || selections);

    const novoPedido = {
      id: Date.now(),
      items: itemsArray,
      valorTotal: dadosRecebidos.valorTotal || 0,
      dataCriacao: new Date().toLocaleString('pt-BR')
    };
    
    setPedidos([...pedidos, novoPedido]);
    setSelections({});
    setCurrentStep(passos.length + 1); // Vai para a tela de Carrinho
  };

  const handleIncluirMaisPedidos = () => {
    setSelections({});
    setCurrentStep(0);
  };

  const handleConfirmarPedidos = async () => {
    console.log('🚀 INICIANDO ENVIO DE PEDIDO PARA BACKEND (Integração Completa)');
    
    if (!user || !user.id) {
      alert('❌ ERRO: Usuário não identificado.');
      return;
    }

    if (pedidos.length === 0) {
      alert('Adicione pelo menos um tênis ao carrinho');
      return;
    }

    // ============================================
    // 1. EXTRAIR CONFIGURAÇÃO COMPLETA, CORES E VALORES
    // ============================================
    const coresParaVerificar = [];
    const produtosParaEnvio = [];
    const configsParaEnvio = []; // 🎯 Configurações para o Queue Smart (traduzido)
    const sneakerConfigsCompletas = []; // 🎯 Configurações no formato local (original)
    let valorTotal = 0;
    
    // Coletar todas as cores e configurações dos pedidos
    pedidos.forEach((pedido, index) => {
      // 🎯 EXTRAIR CONFIGURAÇÃO COMPLETA (formato local)
      const configCompleta = extrairConfiguracaoSneaker(pedido.items);
      
      // 🎯 TRADUZIR PARA QUEUE SMART (formato Queue Smart 4.0)
      const configQueueSmart = traduzirParaQueueSmart(configCompleta);

      // A cor para o estoque é a cor em minúsculo
      const corParaEstoque = configCompleta.cor; 
      
      let valorPedido = pedido.valorTotal || 0;
      
      if (pedido.items && Array.isArray(pedido.items)) {
        valorPedido = pedido.items.reduce((total, item) => {
          return total + (item.acrescimo || 0);
        }, 0);
      }
      
      console.log(`🎨 Pedido ${index + 1}: Cor = ${corParaEstoque}, Valor = R$ ${valorPedido.toFixed(2)}`);
      
      // Armazenar para verificação de estoque (por cor)
      coresParaVerificar.push({
        cor: corParaEstoque,
        quantidade: 1,
        index: index
      });
      
      // Armazenar as configurações para envio ao backend
      configsParaEnvio.push(configQueueSmart);
      sneakerConfigsCompletas.push(configCompleta);

      // 🎯 Preparar produto para envio (COM CAMPOS COMPLETOS PARA O BACKEND)
      produtosParaEnvio.push({
        // Campos existentes:
        cor: corParaEstoque, 
        quantidade: 1,
        tamanho: configCompleta.tamanho,
        valor_unitario: valorPedido,
        
        // Campos de passo a passo (para o DB)
        passo_um: configCompleta.estilo,
        passo_dois: configCompleta.material,
        passo_tres: configCompleta.solado,
        // Salva a cor com a primeira letra maiúscula (Branco, Preto...)
        passo_quatro: corParaEstoque.charAt(0).toUpperCase() + corParaEstoque.slice(1), 
        passo_cinco: configCompleta.detalhes
      });
      
      valorTotal += valorPedido;
    });

    // ============================================
    // 2. VERIFICAR ESTOQUE PARA CADA COR
    // ============================================
    console.log('🔍 Verificando estoque para cores:', coresParaVerificar);
    
    const verificacoesEstoque = [];
    let todasCoresDisponiveis = true;
    let mensagemErroEstoque = '';
    
    for (const itemCor of coresParaVerificar) {
      console.log(`📦 Verificando estoque para: ${itemCor.cor}`);
      
      // Usa a cor em minúsculo para a chamada de verificação
      const resultadoEstoque = await verificarEstoqueQueueSmart(itemCor.cor);
      
      verificacoesEstoque.push({
        cor: itemCor.cor,
        disponivel: resultadoEstoque.disponivel,
        quantidade: resultadoEstoque.quantidade,
        mensagem: resultadoEstoque.mensagem
      });
      
      console.log(`    → ${resultadoEstoque.disponivel ? '✅ Disponível' : '❌ Indisponível'}: ${resultadoEstoque.mensagem}`);
      
      if (!resultadoEstoque.disponivel) {
        todasCoresDisponiveis = false;
        mensagemErroEstoque = `A cor "${itemCor.cor.toUpperCase()}" está sem estoque disponível. ${resultadoEstoque.mensagem}`;
        break; // Para na primeira cor sem estoque
      }
    }
    
    // ============================================
    // 3. SE ALGUMA COR NÃO TEM ESTOQUE, ABORTAR
    // ============================================
    if (!todasCoresDisponiveis) {
      alert(`❌ PROBLEMA DE ESTOQUE:\n\n${mensagemErroEstoque}\n\nPor favor, escolha outra cor ou tente novamente mais tarde.`);
      
      console.log('📊 Resumo das verificações de estoque:', verificacoesEstoque);
      return; // Não prossegue com o pedido
    }
    
    console.log('✅ Todas as cores têm estoque disponível!');
    console.log('📊 Verificações completas:', verificacoesEstoque);

    // ============================================
    // 4. MONTAR REQUEST PARA BACKEND (COMPLETO)
    // ============================================
    const requestData = {
      cliente_id: user.id,
      produtos: produtosParaEnvio, 
      // 🎯 NOVOS CAMPOS PARA INTEGRAÇÃO COMPLETA
      configs_queue_smart: configsParaEnvio, 
      sneaker_configs: sneakerConfigsCompletas, 
      
      endereco_entrega: enderecoEntrega,
      metodo_pagamento: "cartao",
      observacoes: "Pedido com configuração completa para Queue Smart 4.0",
      valor_total: valorTotal
    };

    console.log('📤 DADOS ENVIADOS PARA BACKEND:');
    console.log(JSON.stringify(requestData, null, 2));

    try {
      console.log('🔗 Enviando para:', `${API_BASE_URL}/api/orders`);
      
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(requestData)
      });

      const data = await response.json();
      console.log('📦 RESPOSTA DO BACKEND:', data);

      if (response.ok) {
        alert(`🎉 PEDIDO CRIADO COM SUCESSO!\n\n` +
              `ID: ${data.pedido?.id || data.pedidoId}\n` +
              `Código de Rastreio: ${data.pedido?.codigo_rastreio || 'SNK-' + Date.now()}\n` +
              `Status: ${data.pedido?.status || 'Pendente'}\n` +
              `Valor Total: R$ ${valorTotal.toFixed(2)}\n\n` +
              `✅ Estoque verificado e integração Queue Smart funcionando!`);
        
        // Limpar carrinho
        setPedidos([]);
        setCurrentStep(0);
        
      } else {
        // Tratar erros específicos do backend
        if (data.error && data.error.includes('Estoque insuficiente')) {
          alert(`❌ ERRO DE ESTOQUE NO BACKEND:\n${data.error}\n\n` +
                `A verificação inicial passou, mas o backend encontrou inconsistência.\n` +
                `Isso pode indicar uma race condition no sistema de estoque.`);
        } else {
          alert(`❌ ERRO DO BACKEND:\n${data.error || 'Erro desconhecido'}`);
        }
      }

    } catch (error) {
      console.error('❌ ERRO DE CONEXÃO:', error);
      alert('⚠️ Erro de conexão com o servidor. Verifique a internet.');
    }
  };

  const renderCurrentStep = () => {
    if (currentStep < passos.length) {
      return (
        <MenuSelecao
          passo={passos[currentStep]}
          onSelect={(optionId, acrescimo, nome) => handleSelectOption(currentStep, optionId, acrescimo, nome)}
          selectedOption={selections[currentStep]}
          onNext={handleNextStep}
        />
      );
    } else if (currentStep === passos.length) {
      // Passa as seleções como um array para o ResumoPedido
      const itemsArray = Object.values(selections).sort((a, b) => a.step - b.step);
      return (
        <ResumoPedido
          selections={itemsArray}
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
          position: relative;
        }

        .card-header-bar {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 8px;
            background-color: ${primaryColor}; /* Usando a cor do tema */
            border-top-left-radius: 1.5rem;
            border-top-right-radius: 1.5rem;
            transition: background-color 0.3s ease;
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
          <div className="card-header-bar"></div>
          {renderCurrentStep()}
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default PaginaCriarSneaker;