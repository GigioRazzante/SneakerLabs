Projeto Tênis Personalizável – SneakLab
SneakLab é uma plataforma de personalização de tênis que permite aos usuários escolher estilo, material, cor, solado, detalhes e até o "tamanho estrutural" do seu tênis — tudo isso com uma visualização gerada por IA generativa, que cria uma imagem realista do modelo personalizado em tempo real.

🎯 Status do Projeto
✅ SPRINT 01 - Concluída
Sistema de autenticação e cadastro

Processo de personalização em 5 passos

Cálculo de preços em tempo real


✅ SPRINT 02 - Concluída 🎉
Carrinho com múltiplos produtos

Confirmação de pedidos em lote

Rastreamento de status em tempo real

Sistema de callbacks com a produção

Gestão de slots de expedição

🚀 Funcionalidades Implementadas
Personalização Completa:
Estilo: Casual, Corrida, Skate

Material: Couro, Camurça, Tecido

Solado: Borracha, EVA, Air

Cor: Branco, Preto, Azul, Vermelho, Verde, Amarelo

Detalhes: Cadarço normal, colorido ou sem cadarço

Sistema de Pedidos Avançado:
✅ Adicionar múltiplos sneakers ao carrinho

✅ Processamento individual por produto

✅ Rastreamento em tempo real do status

✅ Visualização de slots de produção

✅ Histórico completo de pedidos

Fluxo do Usuário:
Cadastro/Login → Acesso à plataforma

Personalização → 5 passos guiados

Carrinho → Adicionar múltiplos produtos

Confirmação → Envio para produção

Rastreamento → Acompanhamento em tempo real

🧠 Uso de IA Generativa
A IA é utilizada para gerar uma imagem realista do tênis personalizado com base nas seleções feitas pelo usuário.

Modelo usado: Stable Diffusion com ajustes via ControlNet
Integração: API externa (ex: Replicate ou Hugging Face)
Geração baseada em prompts dinâmicos construídos conforme os atributos selecionados

💵 Variações e Preços
1. Estilo (preço base)
Casual – R$ 200
Para uso diário e combinações simples

Corrida – R$ 350
Design leve e pensado para performance

Skate – R$ 300
Mais resistente e com reforço para manobras

2. Material (acréscimo)
Couro – + R$ 100
Durável, elegante e com ótimo acabamento

Camurça – + R$ 120
Toque aveludado e visual moderno

Tecido – + R$ 90
Leve, respirável e confortável

3. Solado (acréscimo)
Borracha – + R$ 40
Clássico, com boa aderência

EVA – + R$ 60
Mais leve e com maior amortecimento

Air – + R$ 90
Tecnologia de amortecimento com bolha de ar

4. Cor (acréscimo)
Branco – + R$ 20
Limpo, versátil e minimalista

Preto – + R$ 30
Sofisticado e fácil de combinar

Azul – + R$ 25
Estilo com um toque de personalidade

Vermelho – + R$ 28
Chamativo e cheio de atitude

Verde – + R$ 23
Fresco e moderno

Amarelo – + R$ 30
Vibrante e ousado

5. Detalhes (cadarço – acréscimo)
Cadarço normal – + R$ 20
Visual tradicional e prático

Cadarço colorido – + R$ 30
Mais ousado, com contraste visual

Sem cadarço – + R$ 35
Design limpo com fácil calce

🔧 Tecnologias Utilizadas
Frontend:
React 18 + Hooks modernos

React Router DOM

Context API para gerenciamento de estado

CSS Modules e design responsivo

Backend:
Node.js + Express.js

PostgreSQL para armazenamento

Sistema de callbacks para produção

API RESTful completa

Integrações:
Máquina de produção industrial

Sistema de rastreamento em tempo real

API de IA generativa

🎨 Interface e Experiência
<div align="center">
Tela de Personalização
<img width="600" height="400" alt="Tela de Personalização" src="https://github.com/user-attachments/assets/c728c672-3d3c-4d06-8ea2-5561ff2adfac" />
Processo de Seleção
<img width="600" height="400" alt="Processo de Seleção" src="https://github.com/user-attachments/assets/dff6773b-838d-4549-89ca-49bd1180f9fc" />
Carrinho de Pedidos
<img width="600" height="400" alt="Carrinho de Pedidos" src="https://github.com/user-attachments/assets/2ed9018d-c36a-40aa-8013-fe13f3a4f740" /></div>
🏗️ Arquitetura do Sistema
Frontend Components:
text
src/
├── components/
│   ├── Navbar.jsx
│   ├── MenuSelecao.jsx
│   ├── ResumoPedido.jsx
│   ├── CarrinhoPedido.jsx
│   └── ResumoPedidoItem.jsx
├── pages/
│   ├── PaginaCriarSneaker.jsx
│   ├── PaginaLogin.jsx
│   ├── PaginaCadastro.jsx
│   └── MeusPedidos.jsx
└── context/
    └── AuthContext.jsx
Backend Routes:
javascript
// Gestão de Pedidos
POST /api/orders          // Criar pedido com múltiplos produtos
GET  /api/orders/:id/status // Rastrear status do pedido
GET  /api/orders/cliente/:clienteId // Listar pedidos do cliente

// Sistema de Produção
POST /api/callback        // Receber atualizações da máquina

// Autenticação
POST /api/auth/register   // Cadastrar usuário
POST /api/auth/login      // Login de usuário
🚀 Próximas Etapas
Integração com IA generativa para visualização

Configuração final da máquina de produção

Sistema de notificações por e-mail

Dashboard administrativo

Visualização 3D dos tênis personalizados

📄 Licença
Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

<div align="center">

🚀 SneakLab - Revolucionando a personalização de tênis!

</div>
