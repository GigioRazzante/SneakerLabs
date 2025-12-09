// scripts/testQueueSmart.js - TESTE SIMPLES
import queueMiddlewareService from '../services/queueMiddlewareService.js';

async function testQueueSmart() {
  console.log('🧪 Testando Queue Smart 4.0');
  console.log('============================');
  
  // 1. Testar conexão
  console.log('\n1. Testando conexão...');
  const conexao = await queueMiddlewareService.testarConexao();
  console.log(conexao.success ? '✅ Conectado' : '❌ Falha');
  
  if (!conexao.success) {
    console.log('Erro:', conexao.error);
    return;
  }
  
  // 2. Testar estoque
  console.log('\n2. Testando estoque azul...');
  try {
    const estoque = await queueMiddlewareService.verificarEstoqueQueueSmart('azul');
    console.log(`✅ Estoque azul: ${estoque.quantidade} disponíveis`);
  } catch (error) {
    console.log('❌ Erro estoque:', error.message);
  }
  
  // 3. Criar payload de teste
  console.log('\n3. Criando payload de teste...');
  const orderDetails = {
    passoUmDeCinco: 'Casual',
    passoQuatroDeCinco: 'Azul'
  };
  
  const payload = queueMiddlewareService.generateQueuePayload(orderDetails, '999', '888');
  console.log('📦 Payload:', JSON.stringify(payload, null, 2));
  
  console.log('\n✅ Testes concluídos!');
  console.log('Pronto para integrar com o frontend! 🚀');
}

// Executar teste
testQueueSmart().catch(console.error);