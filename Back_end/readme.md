# 🚀 SneakerLabs Backend API

![Version](https://img.shields.io/badge/version-4.0.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)
![Render](https://img.shields.io/badge/Deploy-Render-blue)
![Neon](https://img.shields.io/badge/Database-Neon_PostgreSQL-green)
![License](https://img.shields.io/badge/license-MIT-orange)

Backend completo para sistema de produção de tênis personalizados, integrado com **Queue Smart 4.0** e **Gemini AI**.

## 📌 Visão Geral

API desenvolvida em **Node.js + Express** que gerencia todo o fluxo de produção de tênis personalizados:

- ✅ **Autenticação de usuários**
- ✅ **Pedidos com verificação de estoque em tempo real**
- ✅ **Integração total com Queue Smart 4.0**
- ✅ **Sistema de produção automatizado**
- ✅ **Mensagens personalizadas com Gemini AI**
- ✅ **Controle de estoque e rastreamento**

## 🛠️ Tecnologias

- **Node.js 18+** + **Express.js** - Backend API
- **PostgreSQL (Neon)** - Banco de dados serverless
- **Render** - Hosting e deploy
- **Queue Smart 4.0** - Sistema de fila de produção
- **Google Gemini AI** - Inteligência Artificial
- **ES Modules** - Sistema de módulos moderno

## 🚀 Deploy no Render

### Configuração
1. **Crie um Web Service** no Render
2. **Conecte ao repositório GitHub**
3. **Configure variáveis de ambiente**:
   ```env
   DATABASE_URL=postgresql://usuario:senha@endpoint.neon.tech/db?sslmode=require
   MIDDLEWARE_URL=http://52.72.137.244:3000
   GEMINI_API_KEY=sua_chave_aqui
   NODE_ENV=production
Build Settings
Build Command: npm install

Start Command: npm start

Node Version: 18.0.0+

Health Check Path: /api/health

🗄️ Banco Neon PostgreSQL
Configuração Gratuita
Crie conta em neon.tech

Configure banco com:

Compute: 0.25 vCPU / 256 MB

Storage: 3 GB

Branch: main

Conexão Automática
javascript
// Configuração em config/database.js
const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://neondb_owner:npg_yoEJUAXkd9W5@ep-little-band-afek0jf4-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require';
📡 API Endpoints Principais
Autenticação
POST /api/auth/register - Registrar usuário

POST /api/auth/login - Login

Pedidos
POST /api/orders - Criar pedido

GET /api/orders/cliente/:clienteId - Pedidos do cliente

GET /api/orders/estoque/cor/:cor - Verificar estoque

Produção
POST /api/callback - Callback do Queue Smart

Inteligência Artificial
POST /api/mensagem-ai/gerar - Gerar mensagem personalizada

GET /api/mensagem-ai/test - Testar Gemini API

Sistema
GET /api/health - Health check completo

GET /api/config - Configuração do sistema

GET /api/integration/status - Status das integrações

🔧 Execução Local
bash
# 1. Clone o repositório
git clone https://github.com/GigioRazzante/SneakerLabs
cd SneakerLabs/Back_end

# 2. Instale dependências
npm install

# 3. Configure ambiente
cp .env.example .env
# Edite o .env com suas configurações

# 4. Inicie o servidor
npm run dev          # Modo desenvolvimento
npm start           # Modo produção

# 5. Acesse
# Local: http://localhost:10000
# Health: http://localhost:10000/api/health
📁 Estrutura do Projeto
text
Back_end/
├── config/          # Configurações (banco, Gemini)
├── controllers/     # Lógica de negócio
├── routes/         # Definição de rotas
├── services/       # Serviços externos (Queue Smart, Gemini)
├── scripts/        # Scripts utilitários
├── server.js       # Ponto de entrada
└── package.json    # Dependências
🔗 Integrações
Queue Smart 4.0
Verificação de estoque em tempo real

Ordens de produção automáticas

Callbacks para atualização de status

Rastreamento por etapa

Gemini AI
Mensagens personalizadas para clientes

Fallback automático quando API indisponível

Armazenamento de mensagens por pedido

🧪 Testes Rápidos
bash
# Teste conexão com Queue Smart
curl https://seuservidor.onrender.com/api/integration/test/queue

# Teste Gemini AI
curl https://seuservidor.onrender.com/api/mensagem-ai/test

# Health check
curl https://seuservidor.onrender.com/api/health

# Criar pedido teste
curl -X POST https://seuservidor.onrender.com/api/test/pedido \
  -H "Content-Type: application/json" \
  -d '{"cliente_id":1,"cor":"azul","quantidade":1}'
📊 Monitoramento
Health Check
Endpoint: GET /api/health

json
{
  "status": "healthy",
  "services": {
    "database": "connected",
    "queue_smart": "connected",
    "gemini_ai": "configured"
  }
}
Logs
Console logs detalhados

Timestamps automáticos

Erros formatados para debugging

⚠️ Solução de Problemas
Erro: "Cannot find module"
bash
# Verifique se o arquivo existe
ls -la Back_end/routes/

# Use Node.js 18+
node --version

# Reinstale dependências
rm -rf node_modules package-lock.json
npm install
Erro de Conexão com Banco
Verifique DATABASE_URL no Render

Teste conexão com Neon Dashboard

Execute SELECT 1 no banco

Queue Smart Offline
Sistema usa modo fallback automático

Pedidos continuam funcionando

Estoque simulado localmente

🤝 Contribuição
Fork o projeto

Crie uma branch (git checkout -b feature/nova-funcionalidade)

Commit suas mudanças (git commit -m 'Adiciona nova funcionalidade')

Push para a branch (git push origin feature/nova-funcionalidade)

Abra um Pull Request

📄 Licença
Este projeto está licenciado sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

📞 Suporte
Issues GitHub: Reportar problema

Documentação: /api/config no seu servidor

Health Check: /api/health para diagnóstico

Desenvolvido por SneakerLabs Team
Deploy: Render + Neon PostgreSQL
Versão: 4.0.0
Status: ✅ Produção

text

Este README está otimizado para uma página, com todas as informações essenciais para começar a usar o backend do SneakerLabs. Ele inclui:
- Instalação rápida
- Configuração para deploy no Render
- Conexão com Neon PostgreSQL
- Endpoints principais
- Exemplos de uso
- Solução de problemas comuns
