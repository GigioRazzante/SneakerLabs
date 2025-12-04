// Back_end/services/openaiService-fix.js
export default {
  gerarMensagemPersonalizada: async (configSneaker, nomeUsuario) => {
    return `🎉 ${nomeUsuario || "Cliente"}, seu sneaker personalizado está pronto!`;
  }
};