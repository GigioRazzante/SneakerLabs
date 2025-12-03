// config/openaiConfig.js
export const openaiConfig = {
    // 🎯 CONFIGURAÇÃO FREE TIER
    model: 'gpt-3.5-turbo',
    maxTokens: 150,
    temperature: 0.7,
    
    // 🎯 LIMITES FREE TIER
    rateLimit: {
      requestsPerMinute: 3, // Free tier é limitado
      maxRetries: 2
    },
    
    // 🎯 FALLBACK CONFIG
    useFallback: true,
    fallbackQuality: 'high' // high/medium/low
  };