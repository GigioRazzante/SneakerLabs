// config/secrets.js - NÃO COMMITAR CHAVES REAIS!
// Todas as chaves vêm de variáveis de ambiente

// ✅ CORRETO E SEGURO:
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

// Para desenvolvimento local, você pode criar um .env.local
// Mas NUNCA comita o .env.local no Git!

// Exemplo de .env.local (criar localmente, NÃO commitar):
// OPENAI_API_KEY=sk-test-123...  // Chave de TESTE apenas
// DB_USER=postgres
// DB_HOST=localhost
// DB_NAME=SneakerLabsDB
// DB_PASSWORD=senai
// DB_POR