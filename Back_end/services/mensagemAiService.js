import fetch from 'node-fetch';

class MensagemAiService {
  constructor() {
    this.apiKey = 'AIzaSyDDO3BLHGwL_uuCDiBT_pwDECy1eBID4JI';
    this.baseUrl = 'https://generativelanguage.googleapis.com';
    console.log('🔧 MensagemAiService inicializado - Usando Gemini 2.5/2.0');
  }

  async gerarMensagemPersonalizada(configSneaker, nomeUsuario) {
    try {
      console.log('💬 Gerando mensagem personalizada para:', nomeUsuario);
      
      const prompt = this.criarPrompt(configSneaker, nomeUsuario);
      
      // 🎯 MODELOS DISPONÍVEIS NA SUA API KEY (ORDEM DE PRIORIDADE)
      const modelosParaTentar = [
        'gemini-2.5-flash',        // Mais rápido e eficiente
        'gemini-2.0-flash',        // Alternativa rápida
        'gemini-2.5-flash-lite',   // Lite version
        'gemini-2.0-flash-lite'    // Lite alternativa
      ];

      for (const modelo of modelosParaTentar) {
        try {
          console.log(`🔄 Tentando modelo: ${modelo}`);
          
          const endpoint = `${this.baseUrl}/v1/models/${modelo}:generateContent`;
          const response = await fetch(`${endpoint}?key=${this.apiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: prompt
                }]
              }],
              generationConfig: {
                temperature: 0.8,  // Um pouco mais criativo
                maxOutputTokens: 300,
                topP: 0.9,
                topK: 40
              }
            })
          });

          if (response.ok) {
            const data = await response.json();
            console.log(`✅ SUCESSO com modelo: ${modelo}`);
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
              const mensagem = data.candidates[0].content.parts[0].text;
              console.log('💌 Mensagem gerada via Gemini AI');
              return this.limparMensagem(mensagem);
            }
          } else {
            const errorText = await response.text();
            console.log(`❌ Modelo ${modelo} falhou:`, response.status);
            continue;
          }
        } catch (error) {
          console.log(`❌ Erro com modelo ${modelo}:`, error.message);
          continue;
        }
      }

      // 🎯 SE NENHUM MODELO 2.5/2.0 FUNCIONAR, USA MENSAGEM LOCAL
      console.log('💫 Nenhum modelo Gemini funcionou, usando mensagem local personalizada');
      return this.mensagemPersonalizadaLocal(configSneaker, nomeUsuario);
      
    } catch (error) {
      console.error('❌ Erro crítico ao gerar mensagem:', error);
      return this.mensagemPersonalizadaLocal(configSneaker, nomeUsuario);
    }
  }

  criarPrompt(configSneaker, nomeUsuario) {
    const { 
      estilo = 'Casual',
      material = 'Couro', 
      cor = 'Branco',
      solado = 'Borracha',
      detalhes = 'clássicos'
    } = configSneaker;

    return `
Você é um assistente especializado da SneakLab, uma marca premium de sneakers personalizados.

Crie uma mensagem ÚNICA e PERSONALIZADA para ${nomeUsuario} que acabou de criar um sneaker customizado.

DETALHES DO SNEAKER:
• Estilo: ${estilo}
• Material: ${material}
• Cor: ${cor}
• Solado: ${solado}
• Detalhes: ${detalhes}

DIRETRIZES:
- Comece com um cumprimento caloroso usando o nome ${nomeUsuario}
- Destaque 2-3 características específicas que tornam este sneaker especial
- Mostre entusiasmo genuíno pelo design único criado
- Confirme que o pedido está sendo processado
- Agradeça pela criatividade e preferência
- Use tom inspirador, moderno e premium
- Máximo de 3 parágrafos curtos
- Inclua 1-2 emojis relevantes (não exagere)

NÃO use:
- Marcadores ou numeração
- Texto genérico ou repetitivo
- Informações técnicas complexas
- Muitos emojis (máximo 2)

Escreva uma mensagem autêntica que soe como um especialista de sneakers animado com uma criação única.
`;
  }

  // 🎯 MENSAGENS LOCAIS SUPER PERSONALIZADAS (FALLBACK)
  mensagemPersonalizadaLocal(configSneaker, nomeUsuario) {
    const { estilo, material, cor, solado, detalhes } = configSneaker;
    
    const combinacoes = {
      'Corrida': `🏃‍♂️ ${nomeUsuario}, seu sneaker de CORRIDA é pura performance! O ${material} ${cor} com solado ${solado} e ${detalhes} foi projetado para velocidades incríveis. Cada passo será mais confortável e estiloso!\n\n📦 Seu pedido já está confirmado e em breve iniciaremos a produção. Mal podemos esperar para você dominar as pistas com esse design!\n\nAgradecemos por escolher o SneakLab! 👟✨`,
      
      'Casual': `👟 ${nomeUsuario}, que estilo impecável! Seu sneaker CASUAL em ${material} ${cor} com ${detalhes} é a definição de elegância descontraída. Perfeito para transformar qualquer dia comum em algo especial!\n\n✨ Pedido confirmado! Nossa equipe já está preparando tudo para criar seu sneaker exclusivo.\n\nObrigado por confiar no SneakLab para expressar seu estilo único! 💫`,
      
      'Skate': `🛹 ${nomeUsuario}, seu sneaker de SKATE é pura atitude! O ${material} ${cor} com solado ${solado} resistente e ${detalhes} foi feito para dominar os obstáculos com muito estilo e durabilidade.\n\n🚀 Seu design exclusivo já entrou na nossa fila de produção. Em breve você estará deslizando com essa obra-prima!\n\nValeu pela criatividade! O SneakLab agradece! 🤙`,
      
      'Esportivo': `⚡ ${nomeUsuario}, excelente escolha atlética! Seu sneaker ESPORTIVO em ${material} ${cor} com tecnologia ${solado} e ${detalhes} vai elevar seu desempenho em qualquer atividade física.\n\n🏆 Pedido confirmado! Estamos ansiosos para ver você alcançar novos recordes com esse equipamento premium.\n\nO SneakLab agradece por priorizar performance e estilo! 🌟`
    };

    const mensagemEspecifica = combinacoes[estilo] || 
      `🎉 ${nomeUsuario}, sua criação em ${estilo} com ${material} ${cor}, solado ${solado} e ${detalhes} ficou simplesmente incrível! A combinação perfeita entre design inovador e personalidade única.\n\n📋 Seu pedido já está em processamento e em breve estaremos iniciando a produção do seu sneaker exclusivo.\n\nAgradecemos por criar conosco no SneakLab! Mal podemos esperar para você usar essa masterpiece! ✨`;

    return mensagemEspecifica;
  }

  limparMensagem(mensagem) {
    return mensagem
      .replace(/^["']|["']$/g, '')
      .replace(/^\d+[\.\)]\s*/, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .trim();
  }
}

export default new MensagemAiService();