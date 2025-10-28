📝 README Atualizado - Backend SneakLab
🚀 Backend SneakLab - Sistema de Personalização de Tênis
Sistema backend completo para a plataforma SneakLab, responsável por processar pedidos personalizados de tênis, gerenciar produção e fornecer rastreamento em tempo real.

📋 Funcionalidades Implementadas
✅ SPRINT 01 - Concluída
Cadastro e Autenticação de Usuários

Processamento de Pedidos Personalizados

Integração com Sistema de Produção

Cálculo Automático de Preços

✅ SPRINT 02 - Concluída 🎉
Processamento de Múltiplos Produtos por Pedido

Sistema de Callbacks para Rastreamento

Atualização de Status em Tempo Real

Gestão de Slots de Produção

Rastreamento Individual por Produto

🏗️ Arquitetura do Sistema
Banco de Dados PostgreSQL
text
clientes (id, email, senha, nome_usuario, data_nascimento, telefone)
pedidos (id, cliente_id, status_geral, valor_total, data_criacao)
produtos_do_pedido (id, pedido_id, estilo, material, solado, cor, detalhes, status_producao, valor_unitario, id_rastreio_maquina, slot_expedicao)
🔌 Rotas da API
1. 🛒 Gestão de Pedidos
POST /api/orders - Criar pedido com múltiplos produtos

GET /api/orders/:id/status - Rastrear status do pedido

GET /api/orders/cliente/:clienteId - Listar pedidos do cliente

2. 🔄 Sistema de Callbacks
POST /api/callback - Receber atualizações da máquina de produção

3. 👤 Autenticação e Usuários
POST /api/auth/register - Cadastrar novo usuário

POST /api/auth/login - Login de usuário

GET /api/cliente/:id - Buscar dados do cliente

PUT /api/cliente/:id - Atualizar dados do cliente

🎯 Fluxo de Produção
Processamento de Pedidos:
Frontend → Envia pedido com múltiplos produtos

Backend → Separa cada produto individualmente

Backend → Envia cada produto para produção com ID único

Máquina → Processa e envia callback quando pronto

Backend → Atualiza status e slot automaticamente

Frontend → Mostra status atualizado em tempo real

Status de Produção:
FILA - Aguardando processamento

PRONTO - Produção concluída

PENDENTE - Pedido aguardando conclusão

CONCLUIDO - Todos os produtos prontos

🔧 Tecnologias Utilizadas
Node.js + Express.js

PostgreSQL + pg (Pool de conexões)

CORS para comunicação frontend/backend

node-fetch para integração com máquina de produção

🚦 Status do Sistema
✅ Funcionalidades Validadas:
Processamento de pedidos com múltiplos produtos

Sistema de callbacks funcionando

Atualização automática de status

Rastreamento individual por produto

Gestão de slots de produção

🔄 Aguardando Configuração:
Callbacks automáticos da máquina de produção

Processamento real na linha de produção

📊 Estrutura de Dados
Payload para Produção:
json
{
  "payload": {
    "orderId": "SNEAKER-TEMP-123",
    "sku": "KIT-01",
    "order": {
      "codigoProduto": 1,
      "bloco1": {
        "cor": 2,
        "padrao1": "2",
        "padrao2": "2", 
        "padrao3": "2",
        "lamina1": 2,
        "lamina2": 2,
        "lamina3": 2
      }
    }
  },
  "callbackUrl": "http://localhost:3001/api/callback"
}
Callback da Máquina:
json
{
  "id": "id_rastreio_maquina",
  "status": "FINISHED",
  "slot": "A1"
}
🎉 Próximos Passos
Configuração da máquina para callbacks automáticos

Monitoramento em tempo real da produção

Sistema de notificações para clientes

Dashboard administrativo

📄 Licença
Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.