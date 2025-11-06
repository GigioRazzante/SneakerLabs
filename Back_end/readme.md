comando de criação das tabelas no SQL 
-- Tabela de clientes
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    nome_usuario VARCHAR(100) NOT NULL,
    data_nascimento DATE NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de pedidos (mestre)
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id),
    status_geral VARCHAR(50) DEFAULT 'PENDENTE',
    valor_total DECIMAL(10,2) DEFAULT 0,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de produtos do pedido
CREATE TABLE produtos_do_pedido (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER REFERENCES pedidos(id),
    estilo VARCHAR(50),
    material VARCHAR(50),
    solado VARCHAR(50),
    cor VARCHAR(50),
    detalhes VARCHAR(100),
    status_producao VARCHAR(50) DEFAULT 'FILA',
    valor_unitario DECIMAL(10,2) DEFAULT 0,
    id_rastreio_maquina VARCHAR(100),
    slot_expedicao VARCHAR(10)
);

-- Tabela de slots de expedição
CREATE TABLE slots_expedicao (
    id SERIAL PRIMARY KEY,
    status VARCHAR(20) DEFAULT 'LIVRE' CHECK (status IN ('LIVRE', 'OCUPADO')),
    pedido_id INTEGER REFERENCES pedidos(id),
    data_ocupacao TIMESTAMP,
    data_liberacao TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de estoque da máquina
CREATE TABLE estoque_maquina (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    quantidade INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir dados iniciais dos slots
INSERT INTO slots_expedicao (status) VALUES 
('LIVRE'), ('LIVRE'), ('LIVRE'), ('LIVRE'), ('LIVRE');

-- Inserir dados iniciais do estoque
INSERT INTO estoque_maquina (tipo, codigo, nome, quantidade) VALUES
-- LÂMINAS (cores)
('lamina', 'L1', 'Lâmina Branco', 50),
('lamina', 'L2', 'Lâmina Preto', 50),
('lamina', 'L3', 'Lâmina Azul', 50),
('lamina', 'L4', 'Lâmina Vermelho', 50),
('lamina', 'L5', 'Lâmina Verde', 50),
('lamina', 'L6', 'Lâmina Amarelo', 50),

-- BLOCOS (estilos)
('bloco', 'B1', 'Bloco Casual', 5),
('bloco', 'B2', 'Bloco Corrida', 5),
('bloco', 'B3', 'Bloco Skate', 5),

-- MATERIAIS
('material', 'M1', 'Material Couro', 100),
('material', 'M2', 'Material Camurça', 100),
('material', 'M3', 'Material Tecido', 100);

-- Criar índices para melhor performance
CREATE INDEX idx_pedidos_cliente_id ON pedidos(cliente_id);
CREATE INDEX idx_produtos_pedido_id ON produtos_do_pedido(pedido_id);
CREATE INDEX idx_produtos_status ON produtos_do_pedido(status_producao);
CREATE INDEX idx_slots_status ON slots_expedicao(status);
CREATE INDEX idx_estoque_codigo ON estoque_maquina(codigo);

-- Mensagem de confirmação
SELECT 'Todas as tabelas foram criadas com sucesso!' as status;