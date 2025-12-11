// config/geminiConfig.js
export const geminiConfig = {
    // 🎯 Modelo Gemini (gratuito)
    model: 'gemini-1.5-flash', // Ou 'gemini-1.5-pro' para melhor qualidade
    maxTokens: 150,
    temperature: 0.7,
    
    // 🎯 Limites da API gratuita
    rateLimit: {
        requestsPerMinute: 15, // Muito mais generoso que OpenAI
        maxRetries: 2
    },
    
    // 🎯 FALLBACK CONFIG
    useFallback: true,
    fallbackQuality: 'high'
};

// URL da API Gemini
export const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';