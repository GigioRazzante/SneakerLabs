import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import MenuSelecao from '../components/MenuSelecao';
import ResumoPedido from '../components/ResumoPedido';
import CarrinhoPedido from '../components/CarrinhoPedido';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext.jsx';

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

    const handleFinalize = () => {
        const items = Object.keys(selections).map(stepId => {
            const stepIndex = parseInt(stepId, 10);
            const selectedOptionId = selections[stepIndex].id;
            const selectedOption = passos[stepIndex].opcoes.find(opt => opt.id === selectedOptionId);
            
            if (selectedOption) {
                return {
                    step: stepIndex + 1,
                    title: passos[stepIndex].titulo.split(':')[1]?.trim() || passos[stepIndex].titulo,
                    category: passos[stepIndex].titulo.split(':')[0]?.trim(),
                    name: selectedOption.nome,
                    price: selectedOption.preco,
                    acrescimo: selectedOption.acrescimo
                };
            }
            return null;
        }).filter(item => item !== null);

        const novoPedido = {
            id: Date.now(),
            items: items,
            dataCriacao: new Date().toLocaleString('pt-BR')
        };

        setPedidos([...pedidos, novoPedido]);
        setSelections({});
        setCurrentStep(passos.length + 1);
    };

    // ✅ FUNÇÃO QUE ESTAVA FALTANDO
    const handleIncluirMaisPedidos = () => {
        setSelections({});
        setCurrentStep(0);
    };

    const handleConfirmarPedidos = async () => {
        if (pedidos.length === 0) return;

        if (!user || !user.id) {
            alert('Erro: Usuário não identificado. Faça login novamente.');
            return;
        }

        console.log("🔐 USUÁRIO LOGADO:", user);
        console.log("📝 Enviando pedido como cliente ID:", user.id);

        const stepMap = {
            0: "passoUmDeCinco",
            1: "passoDoisDeCinco",
            2: "passoTresDeCinco",
            3: "passoQuatroDeCinco",
            4: "passoCincoDeCinco",
        };

        const produtosParaEnvio = pedidos.map((pedido, pedidoIndex) => {
            const configuracoes = {};

            console.log(`🔍 Analisando pedido ${pedidoIndex + 1}:`);
            
            passos.forEach((passo, index) => {
                const itemDoPedido = pedido.items.find(item => item.step === index + 1);
                if (itemDoPedido) {
                    const newKey = stepMap[index];
                    configuracoes[newKey] = itemDoPedido.name;
                    console.log(`   Passo ${index + 1}: ${itemDoPedido.name}`);
                } else {
                    console.error(`❌ ERRO: Pedido ${pedidoIndex + 1} está faltando o passo ${index + 1}`);
                }
            });

            const passosPreenchidos = Object.keys(configuracoes);
            if (passosPreenchidos.length !== 5) {
                const erroMsg = `❌ Erro: O pedido ${pedidoIndex + 1} está incompleto. Faltam ${5 - passosPreenchidos.length} opções.`;
                console.error(erroMsg);
                alert(erroMsg);
                throw new Error(`Pedido ${pedidoIndex + 1} incompleto`);
            }

            console.log(`✅ Pedido ${pedidoIndex + 1} completo com todos os 5 passos`);

            return {
                configuracoes: configuracoes
            };
        });

        const bodyRequisicao = {
            clienteId: user.id,
            produtos: produtosParaEnvio
        };
        
        console.log("📦 CONFIRMAÇÃO - Cliente ID no request:", bodyRequisicao.clienteId);
        console.log("📦 DETALHES DO PEDIDO PARA BACKEND:");
        console.log("Cliente ID:", user.id);
        console.log("Número de produtos:", produtosParaEnvio.length);
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
            
            alert(`🎉 Pedido #${successData.pedidoId} recebido e ${successData.produtosEnviados.length} produto(s) enviado(s) para produção!`);
            
            setSelections({});
            setPedidos([]);
            setCurrentStep(0);
            
        } catch (error) {
            console.error('❌ Erro na requisição POST /api/orders:', error);
            console.error('Stack trace:', error.stack);
            alert(`Ocorreu um erro ao enviar os pedidos: ${error.message}`);
        }
    };

    // ✅ FUNÇÃO RENDER CORRIGIDA
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
            {/* ✅ TODOS OS SEUS ESTILOS MANTIDOS */}
            <style>{`
                /* VARIÁVEIS GLOBAIS PARA CONSISTÊNCIA */
                :root {
                    --laranja-vibrante: #FF9D00;
                    --preto: #000000;
                    --azul-selecao: #00BFFF;
                    --verde-confirmar: #22C55E;
                    --cinza-claro-fundo: #F5F5F5;
                    --branco: #FFFFFF;
                    --navbar-height: 5rem;
                }
                
                /* CORREÇÕES GLOBAIS DE LAYOUT E ROLAGEM */
                html { overflow-x: hidden; }
                body, html, #root {
                    margin: 0;
                    padding: 0;
                    width: 100%;
                    min-height: 100vh;
                    overflow-x: hidden;
                }
                
                /* Container da Página */
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
                    background-color: var(--branco);
                    border-radius: 1.5rem; 
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15); 
                    padding: 2.5rem;
                    margin: 1.5rem 0; 
                    position: relative;
                }
    
                /* Layout interno do Card */
                .card-header-bar {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 1.5rem;
                    background-color: var(--laranja-vibrante);
                    border-top-left-radius: 1.5rem;
                    border-top-right-radius: 1.5rem;
                }
                .title-section {
                    text-align: center;
                    margin-top: 1.5rem;
                    margin-bottom: 2rem;
                }
                .title {
                    font-size: 2.2rem;
                    font-weight: bold;
                    color: var(--laranja-vibrante);
                }
                .subtitle {
                    color: #555;
                    margin-top: 0.5rem;
                    font-size: 1.1rem;
                }
                
                /* Grid de Seleção */
                .selection-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); 
                    gap: 1.5rem;
                    margin-top: 2rem;
                }
    
                .card-option {
                    /* REMOVIDO: background-color: var(--cinza-claro-fundo); */
                    padding: 1.5rem;
                    text-align: center;
                    border-radius: 0.75rem;
                    transition: all 0.3s ease-in-out;
                    cursor: pointer;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    border: 2px solid var(--laranja-vibrante); 
                    position: relative;
                    overflow: hidden;
                    color: var(--branco); /* Texto branco por padrão, para fundos escuros/imagens */
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    /* Adicionado: fallback para navegadores sem imagem de fundo */
                    background-color: var(--cinza-claro-fundo);
                }

                /* NOVO: Overlay para escurecer a imagem e manter o texto legível */
                .image-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.4); /* Escurece 40% */
                    z-index: 1; /* Abaixo do texto */
                    transition: background-color 0.3s ease;
                }
                .card-option:hover .image-overlay {
                    background-color: rgba(0, 0, 0, 0.55);
                }

                /* NOVO: Ajusta o texto para ficar acima do overlay e garante visibilidade */
                .card-number, .card-price {
                    position: relative;
                    z-index: 2; /* Acima do overlay */
                    color: inherit; /* Usa a cor definida no card-option (branco) */
                    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5); 
                }

                .card-number {
                    font-size: 1.4rem;
                    font-weight: bold;
                }
                .card-price {
                    font-size: 0.9rem;
                    margin-top: 0.5rem;
                    font-weight: 500;
                }
    
                .card-option:hover {
                    border-color: var(--azul-selecao);
                    transform: translateY(-3px);
                    box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
                }
                .card-option.selected {
                    border-width: 3px;
                    border-color: var(--azul-selecao);
                    /* Permite que a cor de fundo seja visível, mas adiciona um anel visual */
                    box-shadow: 0 0 0 4px rgba(0, 191, 255, 0.5);
                }

                /* SOBRESCRITA DE CORES PARA CARDS CLAROS (BRANCO/AMARELO) */
                .card-option[style*="#FFFFFF"] {
                    border-color: #ccc;
                }
                .card-option[style*="#FFFFFF"] .card-number,
                .card-option[style*="#FFFFFF"] .card-price,
                .card-option[style*="#FFC107"] .card-number, 
                .card-option[style*="#FFC107"] .card-price {
                    color: var(--preto);
                    text-shadow: none;
                }

                /* Efeito de seleção em cards de cores escuras: texto branco + anel azul */
                .card-option.selected[style*="#000000"] .card-number, 
                .card-option.selected[style*="#000000"] .card-price {
                    color: var(--branco);
                    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
                }

                /* Botão de Próximo */
                .next-button-container {
                    display: flex;
                    justify-content: center;
                    margin-top: 3rem;
                }
                .next-button {
                    width: 100%;
                    max-width: 300px;
                    background-color: var(--verde-confirmar);
                    color: white;
                    font-weight: 600;
                    padding: 0.8rem;
                    border-radius: 9999px;
                    border: none;
                    transition: background-color 0.3s;
                    font-size: 1.1rem;
                }
                .next-button:hover {
                    background-color: #1A9C4B;
                }
                .next-button:disabled {
                    background-color: #ccc;
                    cursor: not-allowed;
                }
    
                /* ========== ESTILOS PARA O RESUMO DO PEDIDO ========== */
                .summary-list {
                    margin: 2rem 0;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
    
                .summary-item {
                    background-color: var(--cinza-claro-fundo);
                    border-radius: 0.75rem;
                    padding: 1.5rem;
                    border-left: 4px solid var(--laranja-vibrante);
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
    
                .summary-item-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                    border-bottom: 1px solid #ddd;
                    padding-bottom: 0.5rem;
                }
    
                .summary-step {
                    font-weight: bold;
                    color: var(--laranja-vibrante);
                    font-size: 0.9rem;
                }
    
                .summary-category {
                    font-weight: 600;
                    color: var(--preto);
                    font-size: 1rem;
                }
    
                .summary-item-details,
                .summary-item-price {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 0.5rem;
                }
    
                .summary-label {
                    font-weight: 500;
                    color: #666;
                }
    
                .summary-value {
                    font-weight: 600;
                    color: var(--preto);
                }
    
                .summary-total {
                    background-color: #fff8e1;
                    border: 2px solid var(--laranja-vibrante);
                    border-radius: 0.75rem;
                    padding: 1.5rem;
                    margin-top: 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-weight: bold;
                    font-size: 1.2rem;
                }
    
                .total-label {
                    color: var(--preto);
                }
    
                .total-value {
                    color: var(--laranja-vibrante);
                }

                /* ESTILO ESPECÍFICO PARA O VALOR TOTAL (total-price) - COR LARANJA */
                .total-price {
                    color: var(--laranja-vibrante); 
                    font-weight: bold;
                }
                /* ========== FIM DOS ESTILOS DO RESUMO ========== */

                /* ========== ESTILOS PARA O CARRINHO COM MÚLTIPLOS PEDIDOS ========== */
                .pedidos-list {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }
                .pedido-item {
                    background: var(--branco);
                    border-radius: 1rem;
                    padding: 1.5rem;
                    border: 2px solid var(--laranja-vibrante);
                }
                .pedido-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 2px solid var(--laranja-vibrante);
                }
                .pedido-title {
                    color: var(--laranja-vibrante);
                    margin: 0;
                    font-size: 1.3rem;
                }
                .pedido-date {
                    color: #666;
                    font-size: 0.9rem;
                }

                .cart-item {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 0.5rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid #ddd;
                }
                
                .item-category {
                    font-weight: 500;
                    color: var(--preto); 
                }
                
                .item-choice {
                    font-weight: 600;
                    color: var(--preto); 
                }

                .pedido-divider {
                    border: none;
                    border-top: 2px dashed var(--laranja-vibrante);
                    margin: 2rem 0;
                }
                .total-geral {
                    background-color: #fff8e1;
                    border: 2px solid var(--laranja-vibrante);
                    border-radius: 1rem;
                    padding: 1.5rem;
                    margin-top: 1rem;
                }
                .total-geral-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-weight: bold;
                    font-size: 1.3rem;
                }
                .total-geral-label {
                    color: var(--preto);
                }
                .total-geral-value {
                    color: var(--laranja-vibrante);
                }

                .cart-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    width: 100%;
                    max-width: 400px;
                    margin: 2rem auto 0; 
                }

                .confirm-button, .add-more-button {
                    padding: 1rem 2rem;
                    border: none;
                    border-radius: 9999px;
                    font-weight: 600;
                    font-size: 1.1rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-align: center;
                }

                .confirm-button {
                    background-color: var(--verde-confirmar);
                    color: white;
                }

                .confirm-button:hover {
                    background-color: #1A9C4B;
                    transform: translateY(-2px);
                }

                .add-more-button {
                    background-color: var(--laranja-vibrante);
                    color: white;
                }

                .add-more-button:hover {
                    background-color: #e68a00;
                    transform: translateY(-2px);
                }
                
                /* ========== FIM DOS ESTILOS DO CARRINHO COM MÚLTIPLOS PEDIDOS ========== */
                
                /* RESPONSIVIDADE */
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
                    .title {
                        font-size: 1.8rem;
                    }
                    .selection-grid {
                        grid-template-columns: 1fr 1fr; 
                        gap: 1rem;
                    }
                    
                    /* Responsividade para o resumo */
                    .summary-item {
                        padding: 1rem;
                    }
                    
                    .summary-item-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.25rem;
                    }
                    
                    .summary-total {
                        padding: 1rem;
                        font-size: 1.1rem;
                    }

                    /* Responsividade para o carrinho com múltiplos pedidos */
                    .pedido-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.5rem;
                    }
                    
                    .pedido-item {
                        padding: 1rem;
                    }
                    
                    .total-geral {
                        padding: 1rem;
                    }
                    
                    .total-geral-content {
                        font-size: 1.1rem;
                        flex-direction: column;
                        gap: 0.5rem;
                        text-align: center;
                    }
                }
    
                @media (max-width: 480px) {
                    .main-content-card {
                        padding: 1rem;
                        margin: 0.5rem 0;
                        border-radius: 1rem;
                    }
                    .title {
                        font-size: 1.5rem;
                    }
                    .selection-grid {
                        grid-template-columns: 1fr; 
                    }

                    .image-placeholder {
                        padding: 2rem 1rem;
                    }

                    .image-placeholder span {
                        font-size: 3rem;
                    }

                    .cart-summary {
                        padding: 1rem;
                    }
                    .cart-actions {
                        max-width: 100%;
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