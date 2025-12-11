# 👟 SneakLab - Plataforma Completa de Tênis Personalizados

![React](https://img.shields.io/badge/React-18-61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-green)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF)
![QueueSmart](https://img.shields.io/badge/Queue_Smart-4.0-blue)
![Gemini](https://img.shields.io/badge/Gemini_AI-Google-orange)

## 🎯 Visão Geral

**SneakLab** é uma plataforma completa de personalização e produção de tênis que integra **frontend interativo**, **backend robusto** e **sistemas de produção inteligente**. Os usuários criam tênis únicos com IA generativa e acompanham todo o processo de fabricação em tempo real.

## 🏗️ Arquitetura do Sistema
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Frontend │ │ Backend API │ │ Queue Smart │
│ React + Vite │◄──►│ Node.js │◄──►│ 4.0 │
│ Dashboard │ │ Express │ │ Produção │
└─────────────────┘ └─────────────────┘ └─────────────────┘
│ │ │
│ ▼ ▼
│ ┌─────────────────┐ ┌─────────────────┐
│ │ PostgreSQL │ │ Gemini AI │
└──────────────►│ (Neon) │ │ (Google) │
└─────────────────┘ └─────────────────┘

text

## ✨ Funcionalidades Principais

### 🎨 **Customização Avançada** (Frontend)
- Interface visual para personalização passo-a-passo
- 6 categorias de customização: Estilo, Material, Cor, Solado, Detalhes, Tamanho
- Preço dinâmico calculado em tempo real
- Visualização com IA generativa

### 🤖 **IA Generativa** (Integração)
- Geração de imagens realistas dos tênis customizados
- Stable Diffusion + ControlNet para alta qualidade
- Visualização instantânea das combinações

### 🏭 **Sistema de Produção** (Backend + Queue Smart)
- **Backend**: API REST com Node.js + Express
- **Banco**: PostgreSQL Neon (serverless)
- **Integração**: Queue Smart 4.0 para produção automatizada
- **Rastreamento**: Status em tempo real do pedido

### 📱 **Dashboard do Cliente** (Frontend)
- Painel personalizado para cada usuário
- Histórico completo de pedidos
- Rastreamento detalhado da produção
- Gestão de perfil e preferências

## 🛠️ Tecnologias Utilizadas

### **Frontend** (`/Front_end`)
- **React 18** com Hooks modernos
- **Vite 5** para build ultra-rápido
- **Tailwind CSS** para estilização
- **Context API** para gerenciamento de estado
- **React Router** para navegação
- **TypeScript** para tipagem segura

### **Backend** (`/Back_end`)
- **Node.js 18+** com ES Modules
- **Express.js** para API REST
- **PostgreSQL** (Neon) para banco de dados
- **Queue Smart 4.0** para integração de produção
- **Google Gemini AI** para mensagens personalizadas
- **Render** para hosting e deploy

### **Integrações**
- **Queue Smart 4.0**: Sistema de fila de produção
- **Neon PostgreSQL**: Banco de dados serverless
- **Google Gemini**: Inteligência Artificial
- **Render**: Deploy automático

## 🚀 Implantação

### **Frontend** (Render)
- Build automático com Vite
- Deploy contínuo do GitHub
- HTTPS automático
- Domain personalizado

### **Backend** (Render)
- Web Service Node.js
- Banco Neon PostgreSQL
- Variáveis de ambiente seguras
- Health checks automáticos

### **Banco de Dados** (Neon)
- PostgreSQL serverless
- 3GB storage gratuito
- Branching automático
- Connection pooling

## 📁 Estrutura do Repositório
SneakerLabs/
├── 📂 Front_end/ # Aplicação React
│ ├── src/ # Código fonte
│ ├── public/ # Assets estáticos
│ ├── package.json # Dependências frontend
│ └── vite.config.js # Configuração Vite
│
├── 📂 Back_end/ # API Node.js
│ ├── config/ # Configurações
│ ├── controllers/ # Lógica de negócio
│ ├── routes/ # Endpoints API
│ ├── services/ # Integrações externas
│ ├── server.js # Ponto de entrada
│ └── package.json # Dependências backend
│
├── 📂 Database/ # Scripts SQL (se houver)
├── 📜 README.md # Esta documentação
└── 📜 .gitignore # Arquivos ignorados

text

## 🔧 Configuração Rápida

### **1. Frontend Local**
```bash
cd Front_end
npm install
npm run dev
# Acesse: http://localhost:5173
2. Backend Local
bash
cd Back_end
npm install
cp .env.example .env
# Configure suas variáveis
npm run dev
# API em: http://localhost:10000
3. Variáveis de Ambiente
env
# Backend (.env)
DATABASE_URL=postgresql://...
MIDDLEWARE_URL=http://52.72.137.244:3000
GEMINI_API_KEY=your_key_here

# Frontend (.env.local)
VITE_API_URL=https://sneakerslab-backend.onrender.com
📡 API Endpoints Principais
Autenticação
POST /api/auth/register - Registrar usuário

POST /api/auth/login - Login

Pedidos
POST /api/orders - Criar pedido personalizado

GET /api/orders/cliente/:id - Pedidos do cliente

GET /api/orders/estoque/cor/:cor - Verificar estoque

Produção
POST /api/callback - Webhook do Queue Smart

Sistema
GET /api/health - Health check completo

GET /api/config - Configuração do sistema

🎨 Customização Disponível
Categoria	Opções	Preço Base
Estilo	Casual, Corrida, Skate	R$ 200-350
Material	Couro, Camurça, Tecido	+ R$ 90-120
Cor	Branco, Preto, Azul, Vermelho, Verde, Amarelo	+ R$ 20-30
Solado	Borracha, EVA, Air	+ R$ 40-90
Detalhes	Cadarço normal, colorido, sem cadarço	+ R$ 20-35
🔗 Links de Produção
Frontend: https://sneakerslab-frontend.onrender.com

Backend: https://sneakerslab-backend.onrender.com

API Docs: https://sneakerslab-backend.onrender.com/api/config

Health Check: https://sneakerslab-backend.onrender.com/api/health

🤝 Como Contribuir
Fork este repositório

Crie uma branch: git checkout -b minha-feature

Commit suas mudanças: git commit -m 'Minha nova feature'

Push: git push origin minha-feature

Abra um Pull Request

📄 Licença
Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

👥 Equipe
Desenvolvido como projeto acadêmico/profissional com foco em:

Integração de sistemas (Frontend + Backend + Produção)

Experiência do usuário com personalização visual

Automação industrial através de Queue Smart 4.0

Inteligência Artificial aplicada a produtos customizados

Status: ✅ Em produção
Última atualização: Dezembro 2024
Repositório: github.com/GigioRazzante/SneakerLabs