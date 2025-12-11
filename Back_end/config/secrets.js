// config/secrets.js - NÃO COMMITAR CHAVES REAIS!

// ✅ Gemini API (substituindo OpenAI)
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Para desenvolvimento local, crie um .env.local com:
// GEMINI_API_KEY=AIzaSyD...sua-chave-aqui
// DB_USER=postgres
// DB_HOST=localhost
// DB_NAME=SneakerLabsDB
// DB_PASSWORD=senai
// DB_PORT=5432