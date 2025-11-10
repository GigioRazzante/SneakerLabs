// config/openai.js
import dotenv from 'dotenv';

// Carregar env especificamente para este arquivo
dotenv.config();

const openaiConfig = {
  apiKey: process.env.OPENAI_API_KEY,
};

// Debug
console.log('🔑 Config OpenAI:');
console.log('API Key existe?', !!openaiConfig.apiKey);
console.log('API Key inicia com:', openaiConfig.apiKey ? openaiConfig.apiKey.substring(0, 10) : 'N/A');

if (!openaiConfig.apiKey) {
  console.error('❌ ERRO CRÍTICO: OPENAI_API_KEY não encontrada no .env');
  console.log('📋 Verifique:');
  console.log('1. O arquivo .env está na raiz do projeto?');
  console.log('2. O nome da variável está correto?');
  console.log('3. Não há espaços ou caracteres especiais?');
}

export default openaiConfig;